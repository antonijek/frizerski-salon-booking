const query = require("../utils/query");

function withDateFilter(baseWhere, period, start_date, end_date) {
    const salonWhere = baseWhere
        ? `${baseWhere} AND a.salon_id = ?`
        : "WHERE a.salon_id = ?";
    if (period === "all") return salonWhere;
    if (period === "custom" && start_date && end_date) {
        return baseWhere
            ? `${baseWhere} AND a.date >= ? AND a.date <= ? AND a.salon_id = ?`
            : "WHERE a.date >= ? AND a.date <= ? AND a.salon_id = ?";
    }
    const map = {
        week: "WHERE a.date >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL WEEKDAY(NOW()) DAY) AND a.date <= DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL (6 - WEEKDAY(NOW())) DAY) AND a.salon_id = ?",
        month: "WHERE a.date >= DATE_FORMAT(NOW(), '%Y-%m-01') AND a.date <= LAST_DAY(DATE_FORMAT(NOW(), '%Y-%m-%d')) AND a.salon_id = ?",
        year: "WHERE a.date >= DATE_FORMAT(NOW(), '%Y-01-01') AND a.date <= DATE_FORMAT(NOW(), '%Y-12-31') AND a.salon_id = ?",
    };
    return map[period] || "WHERE a.salon_id = ?";
}

function getParams(period, start_date, end_date, salonId, extraParams = []) {
    if (period === "custom" && start_date && end_date) {
        return [start_date, end_date, salonId, ...extraParams];
    }
    return [salonId, ...extraParams];
}

async function getStats(salonId, period, start_date, end_date) {
    const stats = {};

    // Ukupan broj termina (u periodu)
    const totalSql = `SELECT COUNT(*) as total FROM appointments a ${withDateFilter("", period, start_date, end_date)}`;
    const totalResults = await query(
        totalSql,
        getParams(period, start_date, end_date, salonId),
    );
    stats.totalAppointments = totalResults[0].total;

    // Termini po uslugama (u periodu)
    const byServiceSql = `SELECT a.service, COUNT(*) as count FROM appointments a ${withDateFilter("", period, start_date, end_date)} GROUP BY a.service ORDER BY count DESC`;
    const serviceResults = await query(
        byServiceSql,
        getParams(period, start_date, end_date, salonId),
    );
    stats.appointmentsByService = serviceResults;

    // Termini po frizerima (u periodu)
    const byBarberSql = `SELECT b.name, COUNT(a.id) as count FROM appointments a RIGHT JOIN barbers b ON a.barber_id = b.id ${withDateFilter("", period, start_date, end_date)} GROUP BY b.id, b.name ORDER BY count DESC`;
    const barberResults = await query(
        byBarberSql,
        getParams(period, start_date, end_date, salonId),
    );
    stats.appointmentsByBarber = barberResults;

    // Mesečna statistika (u periodu)
    const monthlySql = `SELECT DATE_FORMAT(a.date, '%Y-%m') as month, COUNT(*) as count FROM appointments a ${withDateFilter("", period, start_date, end_date)} GROUP BY DATE_FORMAT(a.date, '%Y-%m') ORDER BY month`;
    const monthlyResults = await query(
        monthlySql,
        getParams(period, start_date, end_date, salonId),
    );
    stats.monthlyStats = monthlyResults;

    // Prihod po mesecima (u periodu)
    const revenueSql = `SELECT DATE_FORMAT(a.date, '%Y-%m') as month, COALESCE(SUM(s.price), 0) as revenue FROM appointments a LEFT JOIN services s ON a.service = s.name AND s.salon_id = a.salon_id ${withDateFilter("", period, start_date, end_date)} GROUP BY DATE_FORMAT(a.date, '%Y-%m') ORDER BY month`;
    const revenueResults = await query(
        revenueSql,
        getParams(period, start_date, end_date, salonId),
    );
    stats.monthlyRevenue = revenueResults;

    // Broj korisnika (uvek ukupno, nezavisno od filtera)
    const usersResults = await query(
        "SELECT COUNT(*) as total FROM users WHERE salon_id = ?",
        [salonId],
    );
    stats.totalUsers = usersResults[0].total;

    // Današnji termini (uvek danas)
    const todayResults = await query(
        "SELECT COUNT(*) as count FROM appointments WHERE date = DATE_FORMAT(NOW(), '%Y-%m-%d') AND salon_id = ?",
        [salonId],
    );
    stats.todayAppointments = todayResults[0].count;

    // Broj aktivnih usluga (uvek ukupno)
    const servicesResults = await query(
        "SELECT COUNT(*) as total FROM services WHERE salon_id = ?",
        [salonId],
    );
    stats.totalServices = servicesResults[0].total;

    // Broj aktivnih frizera (uvek ukupno)
    const barbersResults = await query(
        "SELECT COUNT(*) as total FROM barbers WHERE is_active = 1 AND salon_id = ?",
        [salonId],
    );
    stats.totalBarbers = barbersResults[0].total;

    // Ukupna zarada (u periodu)
    const revenueTotalSql = `SELECT COALESCE(SUM(s.price), 0) as total FROM appointments a LEFT JOIN services s ON a.service = s.name AND s.salon_id = a.salon_id ${withDateFilter("", period, start_date, end_date)}`;
    const revenueTotalResults = await query(
        revenueTotalSql,
        getParams(period, start_date, end_date, salonId),
    );
    stats.totalRevenue = revenueTotalResults[0].total;

    return stats;
}

module.exports = { getStats };
