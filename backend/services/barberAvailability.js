const query = require("../utils/query");
const AppError = require("../utils/AppError");

/**
 * Pronađi prvog dostupnog frizera za dati termin.
 * Vraća barber_id ili null ako nema slobodnog.
 */
async function findAvailableBarber(
    salonId,
    date,
    time,
    serviceDuration,
    preferredBarberId,
) {
    if (preferredBarberId) {
        return preferredBarberId;
    }

    const allBarbers = await query(
        "SELECT id, work_start, work_end, work_days FROM barbers WHERE salon_id = ?",
        [salonId],
    );

    if (allBarbers.length === 0) return null;

    const [newHour, newMinute] = time.split(":").map(Number);
    const newStartMinutes = newHour * 60 + newMinute;
    const newEndMinutes = newStartMinutes + serviceDuration;

    const dateObj = new Date(date + "T00:00:00");
    const dayOfWeek = dateObj.getDay();
    const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;

    const availableBarbers = allBarbers.filter((b) => {
        if (b.work_days) {
            const workDays = b.work_days.split(",").map((d) => d.trim());
            if (!workDays.includes(dbDay.toString())) return false;
        }
        if (b.work_start && b.work_end) {
            const [sH, sM] = b.work_start.split(":").map(Number);
            const [eH, eM] = b.work_end.split(":").map(Number);
            const barberStart = sH * 60 + sM;
            const barberEnd = eH * 60 + eM;
            if (newStartMinutes < barberStart || newEndMinutes > barberEnd)
                return false;
        }
        return true;
    });

    if (availableBarbers.length === 0) return null;

    const barberIds = availableBarbers.map((b) => b.id);
    const placeholders = barberIds.map(() => "?").join(",");
    const checkAppSql = `
        SELECT a.barber_id, a.time, s.duration 
        FROM appointments a 
        LEFT JOIN services s ON a.service = s.name 
        WHERE a.date = ? AND a.barber_id IN (${placeholders}) AND a.salon_id = ?
    `;
    const bookedApps = await query(checkAppSql, [date, ...barberIds, salonId]);

    const bookedByBarber = {};
    bookedApps.forEach((app) => {
        if (!bookedByBarber[app.barber_id]) bookedByBarber[app.barber_id] = [];
        bookedByBarber[app.barber_id].push(app);
    });

    for (const barber of availableBarbers) {
        const barberBookings = bookedByBarber[barber.id] || [];
        const hasOverlap = barberBookings.some((app) => {
            const [eH, eM] = app.time.split(":").map(Number);
            const existStart = eH * 60 + eM;
            const existEnd = existStart + (app.duration || 60);
            return newStartMinutes < existEnd && newEndMinutes > existStart;
        });
        if (!hasOverlap) return barber.id;
    }

    return null;
}

/**
 * Proveri da li postoji preklapanje za datog frizera.
 * Vraća true ako ima preklapanje, false ako je slobodno.
 */
async function checkBarberOverlapAppointment(
    salonId,
    barberId,
    date,
    time,
    service,
    excludeId,
) {
    const [newHour, newMinute] = time.split(":").map(Number);
    const newStartMinutes = newHour * 60 + newMinute;

    const durResults = await query(
        "SELECT duration FROM services WHERE name = ? AND salon_id = ?",
        [service, salonId],
    );
    const serviceDuration = durResults.length > 0 ? durResults[0].duration : 60;
    const newEndMinutes = newStartMinutes + serviceDuration;

    let checkSql;
    let params;
    if (excludeId) {
        checkSql = `
            SELECT a.time, s.duration 
            FROM appointments a 
            LEFT JOIN services s ON a.service = s.name 
            WHERE a.date = ? AND a.barber_id = ? AND a.id != ? AND a.salon_id = ?
        `;
        params = [date, barberId, excludeId, salonId];
    } else {
        checkSql = `
            SELECT a.time, s.duration 
            FROM appointments a 
            LEFT JOIN services s ON a.service = s.name 
            WHERE a.date = ? AND a.barber_id = ? AND a.salon_id = ?
        `;
        params = [date, barberId, salonId];
    }

    const existingApps = await query(checkSql, params);

    const hasOverlap = existingApps.some((app) => {
        const [eH, eM] = app.time.split(":").map(Number);
        const existStart = eH * 60 + eM;
        const existEnd = existStart + (app.duration || 60);
        return newStartMinutes < existEnd && newEndMinutes > existStart;
    });

    return hasOverlap;
}

/**
 * Proveri da li frizer radi u dato vreme. Baca AppError ako ne radi.
 */
async function checkBarberWorkingHours(salonId, barberId, date, time, service) {
    const barberResults = await query(
        "SELECT work_start, work_end, work_days FROM barbers WHERE id = ? AND salon_id = ?",
        [barberId, salonId],
    );

    if (barberResults.length === 0) return;

    const barber = barberResults[0];

    const dateObj = new Date(date + "T00:00:00");
    const dayOfWeek = dateObj.getDay();
    const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;

    if (barber.work_days) {
        const workDays = barber.work_days.split(",").map((d) => d.trim());
        if (!workDays.includes(dbDay.toString())) {
            throw new AppError(
                "Izabrani frizer ne radi na taj dan. Promenite frizera ili izaberite drugi datum.",
                409,
            );
        }
    }

    if (barber.work_start && barber.work_end) {
        const [sH, sM] = barber.work_start.split(":").map(Number);
        const [eH, eM] = barber.work_end.split(":").map(Number);
        const barberStart = sH * 60 + sM;
        const barberEnd = eH * 60 + eM;

        const [newHour, newMinute] = time.split(":").map(Number);
        const newStartMinutes = newHour * 60 + newMinute;

        const durResults = await query(
            "SELECT duration FROM services WHERE name = ? AND salon_id = ?",
            [service, salonId],
        );
        const serviceDuration =
            durResults.length > 0 ? durResults[0].duration : 60;
        const newEndMinutes = newStartMinutes + serviceDuration;

        if (newStartMinutes < barberStart || newEndMinutes > barberEnd) {
            throw new AppError(
                `Izabrani frizer ne radi u to vreme (radno vreme: ${barber.work_start} - ${barber.work_end}). Promenite frizera ili izaberite drugo vreme.`,
                409,
            );
        }
    }
}

module.exports = {
    findAvailableBarber,
    checkBarberOverlapAppointment,
    checkBarberWorkingHours,
};
