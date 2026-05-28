const query = require("../utils/query");
const AppError = require("../utils/AppError");
const {
    findAvailableBarber,
    checkBarberOverlapAppointment,
    checkBarberWorkingHours,
} = require("./barberAvailability");

const {
    sendSalonNotification,
    sendCustomerConfirmation,
    sendCancellationNotification,
} = require("../emailService");

async function getSalonInfo(salonId) {
    const rows = await query(
        "SELECT id, name, email FROM salons WHERE id = ?",
        [salonId],
    );
    return rows.length > 0 ? rows[0] : null;
}

function buildDateFilter(period, start_date, end_date) {
    let dateFilter = "";
    let dateParams = [];
    if (period === "week") {
        dateFilter =
            "WHERE a.date >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL WEEKDAY(NOW()) DAY) AND a.date <= DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL (6 - WEEKDAY(NOW())) DAY)";
    } else if (period === "month") {
        dateFilter =
            "WHERE a.date >= DATE_FORMAT(NOW(), '%Y-%m-01') AND a.date <= LAST_DAY(DATE_FORMAT(NOW(), '%Y-%m-%d'))";
    } else if (period === "year") {
        dateFilter =
            "WHERE a.date >= DATE_FORMAT(NOW(), '%Y-01-01') AND a.date <= DATE_FORMAT(NOW(), '%Y-12-31')";
    } else if (period === "custom" && start_date && end_date) {
        dateFilter = "WHERE a.date >= ? AND a.date <= ?";
        dateParams = [start_date, end_date];
    }
    return { dateFilter, dateParams };
}

async function getAll(salonId) {
    const sql =
        "SELECT DISTINCT a.id, a.name, a.phone, a.email, DATE_FORMAT(a.date, '%Y-%m-%d') as date, a.time, a.service, a.barber_id, b.name as barber_name, a.created_at FROM appointments a LEFT JOIN barbers b ON a.barber_id = b.id WHERE a.salon_id = ? ORDER BY date, a.time";
    return await query(sql, [salonId]);
}

async function getByDate(salonId, date) {
    const sql =
        "SELECT DISTINCT a.id, a.name, a.phone, a.email, DATE_FORMAT(a.date, '%Y-%m-%d') as date, a.time, a.service, COALESCE((SELECT MIN(s2.duration) FROM services s2 WHERE s2.name = a.service), ?) as duration, a.barber_id, b.name as barber_name FROM appointments a LEFT JOIN barbers b ON a.barber_id = b.id WHERE a.date = ? AND a.salon_id = ? ORDER BY a.time";
    const defaultDuration = 30;
    return await query(sql, [defaultDuration, date, salonId]);
}

async function getByDateAndBarber(salonId, date, barberId) {
    const sql =
        "SELECT DISTINCT a.id, a.name, a.phone, a.email, DATE_FORMAT(a.date, '%Y-%m-%d') as date, a.time, a.service, COALESCE((SELECT MIN(s2.duration) FROM services s2 WHERE s2.name = a.service), ?) as duration, a.barber_id, b.name as barber_name FROM appointments a LEFT JOIN barbers b ON a.barber_id = b.id WHERE a.date = ? AND a.barber_id = ? AND a.salon_id = ? ORDER BY a.time";
    const defaultDuration = 30;
    return await query(sql, [defaultDuration, date, barberId, salonId]);
}

async function getByPhone(salonId, phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    const sql =
        "SELECT id, name, phone, email, DATE_FORMAT(date, '%Y-%m-%d') as date, time, service, barber_id, created_at FROM appointments WHERE salon_id = ? ORDER BY date DESC, time DESC";
    const results = await query(sql, [salonId]);

    return results.filter((a) => {
        const dbClean = a.phone.replace(/\D/g, "");
        const dbTrimmed = dbClean.replace(/^0+/, "");
        const inputTrimmed = cleanPhone.replace(/^0+/, "");
        const longer =
            dbTrimmed.length >= inputTrimmed.length ? dbTrimmed : inputTrimmed;
        const shorter =
            dbTrimmed.length >= inputTrimmed.length ? inputTrimmed : dbTrimmed;
        return longer.endsWith(shorter);
    });
}

async function create(salonId, data) {
    const { name, phone, email, date, time, service } = data;
    const barber_id = data.barber_id || null;

    if (!name || !phone || !date || !time || !service) {
        throw new AppError("Sva polja su obavezna", 400);
    }

    // Ne dozvoli zakazivanje u proslosti
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (date < localDate) {
        throw new AppError("Ne možete zakazati termin u prošlosti", 400);
    }

    // Ne dozvoli zakazivanje u vreme koje je vec proslo za danas
    if (date === localDate) {
        const currentMinutes = today.getHours() * 60 + today.getMinutes();
        const [h, m] = time.split(":").map(Number);
        const timeMinutes = h * 60 + m;
        // 30 minuta buffer-a za pripremu
        if (timeMinutes < currentMinutes + 30) {
            throw new AppError(
                "Ne možete zakazati termin u vreme koje je već prošlo",
                400,
            );
        }
    }

    const durationResults = await query(
        "SELECT duration FROM services WHERE name = ? AND salon_id = ?",
        [service, salonId],
    );
    const serviceDuration =
        durationResults.length > 0 ? durationResults[0].duration : 60;

    const assignedBarberId = await findAvailableBarber(
        salonId,
        date,
        time,
        serviceDuration,
        barber_id,
    );

    if (!barber_id && !assignedBarberId) {
        throw new AppError(
            "Termin je već zauzet. Molimo provjerite trajanje usluge ili izaberite drugo vrijeme.",
            409,
        );
    }

    const finalBarberId = assignedBarberId || barber_id || null;

    if (barber_id) {
        const hasOverlap = await checkBarberOverlapAppointment(
            salonId,
            barber_id,
            date,
            time,
            service,
        );
        if (hasOverlap) {
            throw new AppError(
                "Termin je već zauzet. Molimo provjerite trajanje usluge ili izaberite drugo vrijeme.",
                409,
            );
        }
    }

    const insertSql =
        "INSERT INTO appointments (name, phone, email, date, time, service, barber_id, salon_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const result = await query(insertSql, [
        name,
        phone,
        email,
        date,
        time,
        service,
        finalBarberId,
        salonId,
    ]);

    const appointment = { name, phone, email, date, time, service };
    const salonInfo = await getSalonInfo(salonId);
    sendSalonNotification(appointment, salonInfo);
    sendCustomerConfirmation(appointment, salonInfo);

    return {
        id: result.insertId,
        barber_id: finalBarberId,
        message: finalBarberId
            ? "Termin uspešno kreiran i dodeljen frizeru"
            : "Termin uspešno kreiran",
    };
}

async function update(salonId, id, data) {
    const { name, phone, email, date, time, service, barber_id } = data;

    if (!name || !phone || !date || !time || !service) {
        throw new AppError("Sva polja su obavezna", 400);
    }

    // Ne dozvoli izmenu na datum u proslosti
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (date < localDate) {
        throw new AppError(
            "Ne možete izmeniti termin na datum u prošlosti",
            400,
        );
    }

    // Ne dozvoli izmenu na vreme koje je vec proslo za danas
    if (date === localDate) {
        const currentMinutes = today.getHours() * 60 + today.getMinutes();
        const [h, m] = time.split(":").map(Number);
        const timeMinutes = h * 60 + m;
        // 30 minuta buffer-a za pripremu
        if (timeMinutes < currentMinutes + 30) {
            throw new AppError(
                "Ne možete izmeniti termin na vreme koje je već prošlo",
                400,
            );
        }
    }

    const existingResults = await query(
        "SELECT barber_id FROM appointments WHERE id = ? AND salon_id = ?",
        [id, salonId],
    );
    if (existingResults.length === 0) {
        throw new AppError("Termin nije pronadjen", 404);
    }

    const existingBarberId = existingResults[0].barber_id;
    const finalBarberId = barber_id ? barber_id : existingBarberId;

    if (finalBarberId) {
        await checkBarberWorkingHours(
            salonId,
            finalBarberId,
            date,
            time,
            service,
        );
        const hasOverlap = await checkBarberOverlapAppointment(
            salonId,
            finalBarberId,
            date,
            time,
            service,
            id,
        );
        if (hasOverlap) {
            throw new AppError(
                "Frizer je zauzet u tom terminu. Proverite trajanje usluge ili izaberite drugo vreme.",
                409,
            );
        }
    }

    const updateSql =
        "UPDATE appointments SET name = ?, phone = ?, email = ?, date = ?, time = ?, service = ?, barber_id = ? WHERE id = ? AND salon_id = ?";
    const result = await query(updateSql, [
        name,
        phone,
        email,
        date,
        time,
        service,
        finalBarberId,
        id,
        salonId,
    ]);

    if (result.affectedRows === 0) {
        throw new AppError("Termin nije pronadjen", 404);
    }

    const updatedAppointment = { name, phone, email, date, time, service };
    const salonInfo = await getSalonInfo(salonId);
    sendSalonNotification(updatedAppointment, salonInfo);
    sendCustomerConfirmation(updatedAppointment, salonInfo);

    return { message: "Termin uspešno izmenjen" };
}

async function remove(salonId, id) {
    const getSql =
        "SELECT id, name, phone, email, DATE_FORMAT(date, '%Y-%m-%d') as date, time, service FROM appointments WHERE id = ? AND salon_id = ?";
    const results = await query(getSql, [id, salonId]);
    if (results.length === 0) {
        throw new AppError("Termin nije pronadjen", 404);
    }

    const appointment = results[0];

    const deleteSql = "DELETE FROM appointments WHERE id = ? AND salon_id = ?";
    await query(deleteSql, [id, salonId]);

    const salonInfo = await getSalonInfo(salonId);
    sendCancellationNotification(appointment, salonInfo);

    return { message: "Termin uspešno obrisan" };
}

module.exports = {
    buildDateFilter,
    getAll,
    getByDate,
    getByDateAndBarber,
    getByPhone,
    create,
    update,
    remove,
};
