const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticate, isAdmin } = require("../middleware/auth");
const {
    sendSalonNotification,
    sendCustomerConfirmation,
    sendCancellationNotification,
} = require("../emailService");

// ============================================
// Statistika (samo admin)
// ============================================

/**
 * GET /api/appointments/stats - Dohvati statistiku
 * Query parametri:
 *   period: "all" | "week" | "month" | "year" | "custom" (default: "all")
 *   start_date: YYYY-MM-DD (obavezno za custom)
 *   end_date: YYYY-MM-DD (obavezno za custom)
 */
router.get("/stats", authenticate, isAdmin, (req, res) => {
    const { period = "all", start_date, end_date } = req.query;
    const stats = {};

    // Izračunaj WHERE uslov za filter
    let dateFilter = "";
    let dateParams = [];
    if (period === "week") {
        // Tekuća sedmica: od ponedeljka do nedelje
        dateFilter =
            "WHERE a.date >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL WEEKDAY(NOW()) DAY) AND a.date <= DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL (6 - WEEKDAY(NOW())) DAY)";
    } else if (period === "month") {
        // Tekući mesec: od 1. do kraja meseca
        dateFilter =
            "WHERE a.date >= DATE_FORMAT(NOW(), '%Y-%m-01') AND a.date <= LAST_DAY(DATE_FORMAT(NOW(), '%Y-%m-%d'))";
    } else if (period === "year") {
        // Tekuća godina: od 1. januara do 31. decembra
        dateFilter =
            "WHERE a.date >= DATE_FORMAT(NOW(), '%Y-01-01') AND a.date <= DATE_FORMAT(NOW(), '%Y-12-31')";
    } else if (period === "custom" && start_date && end_date) {
        dateFilter = "WHERE a.date >= ? AND a.date <= ?";
        dateParams = [start_date, end_date];
    }

    // Helper za dodavanje WHERE uslova u upite
    const withDateFilter = (baseWhere) => {
        if (period === "all") return baseWhere;
        if (period === "custom" && start_date && end_date) {
            return baseWhere
                ? `${baseWhere} AND a.date >= ? AND a.date <= ?`
                : "WHERE a.date >= ? AND a.date <= ?";
        }
        const map = {
            week: "WHERE a.date >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL WEEKDAY(NOW()) DAY) AND a.date <= DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL (6 - WEEKDAY(NOW())) DAY)",
            month: "WHERE a.date >= DATE_FORMAT(NOW(), '%Y-%m-01') AND a.date <= LAST_DAY(DATE_FORMAT(NOW(), '%Y-%m-%d'))",
            year: "WHERE a.date >= DATE_FORMAT(NOW(), '%Y-01-01') AND a.date <= DATE_FORMAT(NOW(), '%Y-12-31')",
        };
        return map[period] || "";
    };

    // Helper za WHERE za tabele koje nemaju alias "a"
    const withDateFilterNoAlias = (baseWhere) => {
        if (period === "all") return baseWhere;
        if (period === "custom" && start_date && end_date) {
            return baseWhere
                ? `${baseWhere} AND date >= ? AND date <= ?`
                : "WHERE date >= ? AND date <= ?";
        }
        const map = {
            week: "WHERE date >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL WEEKDAY(NOW()) DAY) AND date <= DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL (6 - WEEKDAY(NOW())) DAY)",
            month: "WHERE date >= DATE_FORMAT(NOW(), '%Y-%m-01') AND date <= LAST_DAY(DATE_FORMAT(NOW(), '%Y-%m-%d'))",
            year: "WHERE date >= DATE_FORMAT(NOW(), '%Y-01-01') AND date <= DATE_FORMAT(NOW(), '%Y-12-31')",
        };
        return map[period] || "";
    };

    // Ukupan broj termina (u periodu)
    const totalSql = `SELECT COUNT(*) as total FROM appointments a ${withDateFilter("")}`;
    db.query(totalSql, dateParams, (err, results) => {
        if (err) return res.status(500).json({ error: "Greška na serveru" });
        stats.totalAppointments = results[0].total;

        // Termini po uslugama (u periodu)
        const byServiceSql = `SELECT a.service, COUNT(*) as count FROM appointments a ${withDateFilter("")} GROUP BY a.service ORDER BY count DESC`;
        db.query(byServiceSql, dateParams, (err, results) => {
            if (err)
                return res.status(500).json({ error: "Greška na serveru" });
            stats.appointmentsByService = results;

            // Termini po frizerima (u periodu)
            const byBarberSql = `SELECT b.name, COUNT(a.id) as count FROM appointments a RIGHT JOIN barbers b ON a.barber_id = b.id ${withDateFilter("")} GROUP BY b.id, b.name ORDER BY count DESC`;
            db.query(byBarberSql, dateParams, (err, results) => {
                if (err)
                    return res.status(500).json({ error: "Greška na serveru" });
                stats.appointmentsByBarber = results;

                // Mesečna statistika (u periodu)
                const monthlySql = `SELECT DATE_FORMAT(a.date, '%Y-%m') as month, COUNT(*) as count FROM appointments a ${withDateFilter("")} GROUP BY DATE_FORMAT(a.date, '%Y-%m') ORDER BY month`;
                db.query(monthlySql, dateParams, (err, results) => {
                    if (err)
                        return res
                            .status(500)
                            .json({ error: "Greška na serveru" });
                    stats.monthlyStats = results;

                    // Prihod po mesecima (u periodu)
                    const revenueSql = `SELECT DATE_FORMAT(a.date, '%Y-%m') as month, COALESCE(SUM(s.price), 0) as revenue FROM appointments a LEFT JOIN services s ON a.service = s.name ${withDateFilter("")} GROUP BY DATE_FORMAT(a.date, '%Y-%m') ORDER BY month`;
                    db.query(revenueSql, dateParams, (err, results) => {
                        if (err)
                            return res
                                .status(500)
                                .json({ error: "Greška na serveru" });
                        stats.monthlyRevenue = results;

                        // Broj korisnika (uvek ukupno, nezavisno od filtera)
                        db.query(
                            "SELECT COUNT(*) as total FROM users",
                            (err, results) => {
                                if (err)
                                    return res
                                        .status(500)
                                        .json({ error: "Greška na serveru" });
                                stats.totalUsers = results[0].total;

                                // Današnji termini (uvek danas)
                                db.query(
                                    "SELECT COUNT(*) as count FROM appointments WHERE date = DATE_FORMAT(NOW(), '%Y-%m-%d')",
                                    (err, results) => {
                                        if (err)
                                            return res.status(500).json({
                                                error: "Greška na serveru",
                                            });
                                        stats.todayAppointments =
                                            results[0].count;

                                        // Broj aktivnih usluga (uvek ukupno)
                                        db.query(
                                            "SELECT COUNT(*) as total FROM services",
                                            (err, results) => {
                                                if (err)
                                                    return res
                                                        .status(500)
                                                        .json({
                                                            error: "Greška na serveru",
                                                        });
                                                stats.totalServices =
                                                    results[0].total;

                                                // Broj aktivnih frizera (uvek ukupno)
                                                db.query(
                                                    "SELECT COUNT(*) as total FROM barbers WHERE is_active = 1",
                                                    (err, results) => {
                                                        if (err)
                                                            return res
                                                                .status(500)
                                                                .json({
                                                                    error: "Greška na serveru",
                                                                });
                                                        stats.totalBarbers =
                                                            results[0].total;

                                                        // Ukupna zarada (u periodu)
                                                        const revenueTotalSql = `SELECT COALESCE(SUM(s.price), 0) as total FROM appointments a LEFT JOIN services s ON a.service = s.name ${withDateFilter("")}`;
                                                        db.query(
                                                            revenueTotalSql,
                                                            dateParams,
                                                            (err, results) => {
                                                                if (err)
                                                                    return res
                                                                        .status(
                                                                            500,
                                                                        )
                                                                        .json({
                                                                            error: "Greška na serveru",
                                                                        });
                                                                stats.totalRevenue =
                                                                    results[0].total;

                                                                res.json(stats);
                                                            },
                                                        );
                                                    },
                                                );
                                            },
                                        );
                                    },
                                );
                            },
                        );
                    });
                });
            });
        });
    });
});

// Dohvati sve termine (sa cenom usluge i frizerom)

router.get("/", (req, res) => {
    const sql =
        "SELECT a.id, a.name, a.phone, a.email, DATE_FORMAT(a.date, '%Y-%m-%d') as date, a.time, a.service, s.price, a.barber_id, b.name as barber_name, a.created_at FROM appointments a LEFT JOIN services s ON a.service = s.name LEFT JOIN barbers b ON a.barber_id = b.id ORDER BY a.date, a.time";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        res.json(results);
    });
});

// Dohvati termine za odredjeni datum (sa trajanjem usluge i frizerom)
router.get("/date/:date", (req, res) => {
    const { date } = req.params;
    const sql =
        "SELECT a.id, a.name, a.phone, a.email, DATE_FORMAT(a.date, '%Y-%m-%d') as date, a.time, a.service, s.duration, a.barber_id, b.name as barber_name FROM appointments a LEFT JOIN services s ON a.service = s.name LEFT JOIN barbers b ON a.barber_id = b.id WHERE a.date = ? ORDER BY a.time";
    db.query(sql, [date], (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        res.json(results);
    });
});

// Dohvati termine za odredjeni datum i frizera
router.get("/date/:date/barber/:barberId", (req, res) => {
    const { date, barberId } = req.params;
    const sql =
        "SELECT a.id, a.name, a.phone, a.email, DATE_FORMAT(a.date, '%Y-%m-%d') as date, a.time, a.service, s.duration, a.barber_id, b.name as barber_name FROM appointments a LEFT JOIN services s ON a.service = s.name LEFT JOIN barbers b ON a.barber_id = b.id WHERE a.date = ? AND a.barber_id = ? ORDER BY a.time";
    db.query(sql, [date, barberId], (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        res.json(results);
    });
});

// Dohvati termine po broju telefona
router.get("/phone/:phone", (req, res) => {
    const { phone } = req.params;
    // Ukloni sve ne-cifre iz broja za pretragu
    const cleanPhone = phone.replace(/\D/g, "");
    // Uzmi poslednjih 6+ cifara za SQL pretragu (da nadje i formate sa pozivnim)
    const searchSuffix = cleanPhone.slice(-8);
    const sql =
        "SELECT id, name, phone, email, DATE_FORMAT(date, '%Y-%m-%d') as date, time, service, barber_id, created_at FROM appointments ORDER BY date DESC, time DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        // Filtriraj rezultate - poredimo samo cifre
        // Npr. ako je u bazi +38267551384, a korisnik unese 067551384,
        // treba da se poklopi jer oba imaju "67551384" na kraju
        const filtered = results.filter((a) => {
            const dbClean = a.phone.replace(/\D/g, "");
            // Ukloni vodeće nule iz oba broja
            const dbTrimmed = dbClean.replace(/^0+/, "");
            const inputTrimmed = cleanPhone.replace(/^0+/, "");
            // Proveri da li se duži broj završava sa kraćim
            // (npr. 38267551384 se završava sa 67551384, a 067551384 bez nule je 67551384)
            const longer =
                dbTrimmed.length >= inputTrimmed.length
                    ? dbTrimmed
                    : inputTrimmed;
            const shorter =
                dbTrimmed.length >= inputTrimmed.length
                    ? inputTrimmed
                    : dbTrimmed;
            return longer.endsWith(shorter);
        });
        res.json(filtered);
    });
});

// Kreiraj novi termin
router.post("/", (req, res) => {
    const { name, phone, email, date, time, service } = req.body;
    // Konvertuj barber_id: prazan string -> null, tako da "bilo koji frizer" bude null
    const barber_id = req.body.barber_id || null;

    if (!name || !phone || !date || !time || !service) {
        return res.status(400).json({ error: "Sva polja su obavezna" });
    }

    // Prvo dohvati trajanje izabrane usluge
    const durationSql = "SELECT duration FROM services WHERE name = ?";
    db.query(durationSql, [service], (err, durationResults) => {
        if (err) {
            console.error("Greška pri dohvatanju trajanja usluge:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }

        const serviceDuration =
            durationResults.length > 0 ? durationResults[0].duration : 60;

        // Izračunaj vreme kraja nove rezervacije (u minutima od ponoci)
        const [newHour, newMinute] = time.split(":").map(Number);
        const newStartMinutes = newHour * 60 + newMinute;
        const newEndMinutes = newStartMinutes + serviceDuration;

        // Ako nije izabran frizer, automatski pronadji prvog slobodnog
        const findAvailableBarber = (callback) => {
            if (barber_id) {
                // Izabran je frizer - samo proveri njega
                return callback(null, barber_id);
            }

            // Dohvati sve frizere
            const barberSql =
                "SELECT id, work_start, work_end, work_days FROM barbers";
            db.query(barberSql, (err, allBarbers) => {
                if (err) {
                    console.error("Greška pri dohvatanju frizera:", err);
                    return callback(err);
                }

                if (allBarbers.length === 0) {
                    // Nema frizera u bazi - nastavi bez dodele
                    return callback(null, null);
                }

                // Konvertuj datum u dan u nedelji (1=Pon, ..., 7=Ned)
                const dateObj = new Date(date + "T00:00:00");
                const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
                const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;

                // Filtriraj frizere koji rade na taj dan i u to vreme
                const availableBarbers = allBarbers.filter((b) => {
                    // Proveri radne dane
                    if (b.work_days) {
                        const workDays = b.work_days
                            .split(",")
                            .map((d) => d.trim());
                        if (!workDays.includes(dbDay.toString())) return false;
                    }
                    // Proveri radno vreme
                    if (b.work_start && b.work_end) {
                        const [sH, sM] = b.work_start.split(":").map(Number);
                        const [eH, eM] = b.work_end.split(":").map(Number);
                        const barberStart = sH * 60 + sM;
                        const barberEnd = eH * 60 + eM;
                        if (
                            newStartMinutes < barberStart ||
                            newEndMinutes > barberEnd
                        )
                            return false;
                    }
                    return true;
                });

                if (availableBarbers.length === 0) {
                    return callback(null, null); // nema dostupnih frizera
                }

                // Proveri koji od dostupnih frizera su slobodni u tom terminu
                const barberIds = availableBarbers.map((b) => b.id);
                const placeholders = barberIds.map(() => "?").join(",");
                const checkAppSql = `
                    SELECT a.barber_id, a.time, s.duration 
                    FROM appointments a 
                    LEFT JOIN services s ON a.service = s.name 
                    WHERE a.date = ? AND a.barber_id IN (${placeholders})
                `;
                db.query(
                    checkAppSql,
                    [date, ...barberIds],
                    (err, bookedApps) => {
                        if (err) {
                            console.error("Greška pri proveri termina:", err);
                            return callback(err);
                        }

                        // Grupisi zauzete termine po frizeru
                        const bookedByBarber = {};
                        bookedApps.forEach((app) => {
                            if (!bookedByBarber[app.barber_id])
                                bookedByBarber[app.barber_id] = [];
                            bookedByBarber[app.barber_id].push(app);
                        });

                        // Pronadji prvog frizera koji nema preklapanje
                        for (const barber of availableBarbers) {
                            const barberBookings =
                                bookedByBarber[barber.id] || [];
                            const hasOverlap = barberBookings.some((app) => {
                                const [eH, eM] = app.time
                                    .split(":")
                                    .map(Number);
                                const existStart = eH * 60 + eM;
                                const existEnd =
                                    existStart + (app.duration || 60);
                                return (
                                    newStartMinutes < existEnd &&
                                    newEndMinutes > existStart
                                );
                            });
                            if (!hasOverlap) {
                                return callback(null, barber.id);
                            }
                        }

                        // Svi frizeri su zauzeti
                        return callback(null, null);
                    },
                );
            });
        };

        findAvailableBarber((err, assignedBarberId) => {
            if (err) {
                return res.status(500).json({ error: "Greška na serveru" });
            }

            // Ako nije izabran frizer (bilo koji frizer) i nijedan nije slobodan
            if (!barber_id && !assignedBarberId) {
                return res.status(409).json({
                    error: "Termin je već zauzet. Molimo provjerite trajanje usluge ili izaberite drugo vrijeme.",
                });
            }

            const finalBarberId = assignedBarberId || barber_id || null;

            // Proveri da li imamo preklapanje ako je izabran konkretan frizer
            if (barber_id) {
                const checkSql = `
                    SELECT a.time, s.duration 
                    FROM appointments a 
                    LEFT JOIN services s ON a.service = s.name 
                    WHERE a.date = ? AND a.barber_id = ?
                `;
                db.query(
                    checkSql,
                    [date, barber_id],
                    (err, existingAppointments) => {
                        if (err) {
                            console.error("Greška pri proveri termina:", err);
                            return res
                                .status(500)
                                .json({ error: "Greška na serveru" });
                        }

                        const hasOverlap = existingAppointments.some((app) => {
                            const [existHour, existMinute] = app.time
                                .split(":")
                                .map(Number);
                            const existStartMinutes =
                                existHour * 60 + existMinute;
                            const existDuration = app.duration || 60;
                            const existEndMinutes =
                                existStartMinutes + existDuration;
                            return (
                                newStartMinutes < existEndMinutes &&
                                newEndMinutes > existStartMinutes
                            );
                        });

                        if (hasOverlap) {
                            return res.status(409).json({
                                error: "Termin je već zauzet. Molimo provjerite trajanje usluge ili izaberite drugo vrijeme.",
                            });
                        }

                        createAppointment(finalBarberId);
                    },
                );
            } else {
                createAppointment(finalBarberId);
            }
        });

        function createAppointment(finalBarberId) {
            const sql =
                "INSERT INTO appointments (name, phone, email, date, time, service, barber_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
            db.query(
                sql,
                [name, phone, email, date, time, service, finalBarberId],
                (err, result) => {
                    if (err) {
                        console.error("Greška pri kreiranju termina:", err);
                        return res
                            .status(500)
                            .json({ error: "Greška na serveru" });
                    }
                    const appointment = {
                        name,
                        phone,
                        email,
                        date,
                        time,
                        service,
                    };
                    sendSalonNotification(appointment);
                    sendCustomerConfirmation(appointment);

                    res.status(201).json({
                        id: result.insertId,
                        barber_id: finalBarberId,
                        message: finalBarberId
                            ? "Termin uspešno kreiran i dodeljen frizeru"
                            : "Termin uspešno kreiran",
                    });
                },
            );
        }
    }); // kraj durationSql db.query
});

// Izmeni termin
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, phone, email, date, time, service, barber_id } = req.body;

    if (!name || !phone || !date || !time || !service) {
        return res.status(400).json({ error: "Sva polja su obavezna" });
    }

    // Prvo dohvati postojeći termin da vidimo trenutnog frizera
    const getExistingSql = "SELECT barber_id FROM appointments WHERE id = ?";
    db.query(getExistingSql, [id], (err, existingResults) => {
        if (err) {
            console.error("Greška pri dohvatanju termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        if (existingResults.length === 0) {
            return res.status(404).json({ error: "Termin nije pronadjen" });
        }

        const existingBarberId = existingResults[0].barber_id;

        // Odredi koji barber_id će se koristiti:
        // - Ako je barber_id prazan string ili null, zadrži postojećeg frizera
        // - Ako je barber_id poslat (broj), koristi taj
        const finalBarberId = barber_id ? barber_id : existingBarberId;

        // Ako je dodeljen frizer, proveri da li radi u to vreme i da li je slobodan
        if (finalBarberId) {
            // Prvo proveri radno vreme frizera
            const barberSql =
                "SELECT work_start, work_end, work_days FROM barbers WHERE id = ?";
            db.query(barberSql, [finalBarberId], (err, barberResults) => {
                if (err) {
                    console.error("Greška pri dohvatanju frizera:", err);
                    return res.status(500).json({ error: "Greška na serveru" });
                }

                if (barberResults.length > 0) {
                    const barber = barberResults[0];

                    // Proveri radni dan
                    const dateObj = new Date(date + "T00:00:00");
                    const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
                    const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;

                    if (barber.work_days) {
                        const workDays = barber.work_days
                            .split(",")
                            .map((d) => d.trim());
                        if (!workDays.includes(dbDay.toString())) {
                            return res.status(409).json({
                                error: "Izabrani frizer ne radi na taj dan. Promenite frizera ili izaberite drugi datum.",
                            });
                        }
                    }

                    // Proveri radno vreme
                    if (barber.work_start && barber.work_end) {
                        const [sH, sM] = barber.work_start
                            .split(":")
                            .map(Number);
                        const [eH, eM] = barber.work_end.split(":").map(Number);
                        const barberStart = sH * 60 + sM;
                        const barberEnd = eH * 60 + eM;

                        const [newHour, newMinute] = time
                            .split(":")
                            .map(Number);
                        const newStartMinutes = newHour * 60 + newMinute;

                        // Dohvati trajanje usluge za proveru kraja
                        const durationSql =
                            "SELECT duration FROM services WHERE name = ?";
                        db.query(durationSql, [service], (err, durResults) => {
                            if (err) {
                                console.error(
                                    "Greška pri dohvatanju trajanja:",
                                    err,
                                );
                                return res.status(500).json({
                                    error: "Greška na serveru",
                                });
                            }
                            const serviceDuration =
                                durResults.length > 0
                                    ? durResults[0].duration
                                    : 60;
                            const newEndMinutes =
                                newStartMinutes + serviceDuration;

                            if (
                                newStartMinutes < barberStart ||
                                newEndMinutes > barberEnd
                            ) {
                                return res.status(409).json({
                                    error: `Izabrani frizer ne radi u to vreme (radno vreme: ${barber.work_start} - ${barber.work_end}). Promenite frizera ili izaberite drugo vreme.`,
                                });
                            }

                            // Proveri da li ima preklapanje sa drugim terminima
                            checkBarberOverlap(
                                finalBarberId,
                                date,
                                time,
                                service,
                                id,
                                newStartMinutes,
                                newEndMinutes,
                            );
                        });
                    } else {
                        // Nema radno vreme - samo proveri preklapanje
                        checkBarberOverlap(
                            finalBarberId,
                            date,
                            time,
                            service,
                            id,
                        );
                    }
                } else {
                    // Frizer ne postoji - nastavi bez provere
                    updateAppointment(finalBarberId);
                }
            });
        } else {
            updateAppointment(null);
        }

        function checkBarberOverlap(
            barberId,
            date,
            time,
            service,
            appointmentId,
            newStartMinutes,
            newEndMinutes,
        ) {
            const checkBarberSql = `
                SELECT a.time, s.duration 
                FROM appointments a 
                LEFT JOIN services s ON a.service = s.name 
                WHERE a.date = ? AND a.barber_id = ? AND a.id != ?
            `;
            db.query(
                checkBarberSql,
                [date, barberId, appointmentId],
                (err, barberApps) => {
                    if (err) {
                        console.error("Greška pri proveri frizera:", err);
                        return res
                            .status(500)
                            .json({ error: "Greška na serveru" });
                    }

                    // Ako nismo izračunali vreme, izračunaj sad
                    if (!newStartMinutes || !newEndMinutes) {
                        const [newHour, newMinute] = time
                            .split(":")
                            .map(Number);
                        newStartMinutes = newHour * 60 + newMinute;

                        const durationSql =
                            "SELECT duration FROM services WHERE name = ?";
                        db.query(durationSql, [service], (err, durResults) => {
                            if (err) {
                                console.error(
                                    "Greška pri dohvatanju trajanja:",
                                    err,
                                );
                                return res
                                    .status(500)
                                    .json({ error: "Greška na serveru" });
                            }
                            const serviceDuration =
                                durResults.length > 0
                                    ? durResults[0].duration
                                    : 60;
                            newEndMinutes = newStartMinutes + serviceDuration;
                            checkOverlap(
                                barberApps,
                                newStartMinutes,
                                newEndMinutes,
                                barberId,
                            );
                        });
                    } else {
                        checkOverlap(
                            barberApps,
                            newStartMinutes,
                            newEndMinutes,
                            barberId,
                        );
                    }
                },
            );
        }

        function checkOverlap(
            barberApps,
            newStartMinutes,
            newEndMinutes,
            barberId,
        ) {
            const hasOverlap = barberApps.some((app) => {
                const [eH, eM] = app.time.split(":").map(Number);
                const existStart = eH * 60 + eM;
                const existEnd = existStart + (app.duration || 60);
                return newStartMinutes < existEnd && newEndMinutes > existStart;
            });

            if (hasOverlap) {
                return res.status(409).json({
                    error: "Frizer je zauzet u tom terminu. Proverite trajanje usluge ili izaberite drugo vreme.",
                });
            }

            updateAppointment(barberId);
        }

        function updateAppointment(assignedBarberId) {
            const sql =
                "UPDATE appointments SET name = ?, phone = ?, email = ?, date = ?, time = ?, service = ?, barber_id = ? WHERE id = ?";
            db.query(
                sql,
                [name, phone, email, date, time, service, assignedBarberId, id],
                (err, result) => {
                    if (err) {
                        console.error("Greška pri izmeni termina:", err);
                        return res
                            .status(500)
                            .json({ error: "Greška na serveru" });
                    }
                    if (result.affectedRows === 0) {
                        return res
                            .status(404)
                            .json({ error: "Termin nije pronadjen" });
                    }

                    // Posalji mejlove o izmeni termina
                    const updatedAppointment = {
                        name,
                        phone,
                        email,
                        date,
                        time,
                        service,
                    };
                    sendSalonNotification(updatedAppointment);
                    sendCustomerConfirmation(updatedAppointment);

                    res.json({ message: "Termin uspešno izmenjen" });
                },
            );
        }
    });
});

// Obrisi termin (sa slanjem mejla o otkazivanju)
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    // Prvo dohvati podatke o terminu da bismo poslali mejl
    const getSql =
        "SELECT id, name, phone, email, DATE_FORMAT(date, '%Y-%m-%d') as date, time, service FROM appointments WHERE id = ?";
    db.query(getSql, [id], (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Termin nije pronadjen" });
        }

        const appointment = results[0];

        // Obrisi termin
        const deleteSql = "DELETE FROM appointments WHERE id = ?";
        db.query(deleteSql, [id], (err, result) => {
            if (err) {
                console.error("Greška pri brisanju termina:", err);
                return res.status(500).json({ error: "Greška na serveru" });
            }

            // Posalji mejlove o otkazivanju
            sendCancellationNotification(appointment);

            res.json({ message: "Termin uspešno obrisan" });
        });
    });
});

module.exports = router;
