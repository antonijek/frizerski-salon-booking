const express = require("express");
const router = express.Router();
const db = require("../db");
const {
    sendSalonNotification,
    sendCustomerConfirmation,
    sendCancellationNotification,
} = require("../emailService");

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
        "SELECT id, name, phone, email, DATE_FORMAT(date, '%Y-%m-%d') as date, time, service, created_at FROM appointments ORDER BY date DESC, time DESC";
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
    const { name, phone, email, date, time, service, barber_id } = req.body;

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
                            return res
                                .status(409)
                                .json({ error: "Termin je već zauzet" });
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
    const { name, phone, email, date, time, service } = req.body;

    if (!name || !phone || !date || !time || !service) {
        return res.status(400).json({ error: "Sva polja su obavezna" });
    }

    // Proveri da li je novi termin vec zauzet (osim ako je isti termin)
    const checkSql =
        "SELECT * FROM appointments WHERE date = ? AND time = ? AND id != ?";
    db.query(checkSql, [date, time, id], (err, results) => {
        if (err) {
            console.error("Greška pri proveri termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: "Termin je već zauzet" });
        }

        const sql =
            "UPDATE appointments SET name = ?, phone = ?, email = ?, date = ?, time = ?, service = ? WHERE id = ?";
        db.query(
            sql,
            [name, phone, email, date, time, service, id],
            (err, result) => {
                if (err) {
                    console.error("Greška pri izmeni termina:", err);
                    return res.status(500).json({ error: "Greška na serveru" });
                }
                if (result.affectedRows === 0) {
                    return res
                        .status(404)
                        .json({ error: "Termin nije pronadjen" });
                }
                res.json({ message: "Termin uspešno izmenjen" });
            },
        );
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
