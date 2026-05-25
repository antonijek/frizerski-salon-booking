const db = require("./backend/db");

// Test 1: Simuliramo izmenu termina - menjamo vreme sa 14:00 na 14:30
// postojeci termin: id=1, barber_id=4 (Cakana)
// novi podaci: date=2026-05-24, time=14:30, service='Sisanje', barber_id='' (prazno - zadrzi postojeceg)

const id = 1;
const date = "2026-05-24";
const time = "14:30";
const service = "Sisanje";
const barber_id = ""; // prazno - korisnik nije menjao frizera

// Prvo dohvati postojeci termin
db.query(
    "SELECT barber_id FROM appointments WHERE id = ?",
    [id],
    (err, existingResults) => {
        if (err) {
            console.error(err);
            process.exit();
            return;
        }
        console.log(
            "1. Existing appointment:",
            JSON.stringify(existingResults),
        );

        const existingBarberId = existingResults[0]?.barber_id;
        console.log("   existingBarberId:", existingBarberId);

        // Ovo radi backend:
        const finalBarberId = barber_id ? barber_id : existingBarberId;
        console.log(
            "2. finalBarberId (barber_id ? barber_id : existingBarberId):",
            finalBarberId,
        );
        console.log(
            "   barber_id je:",
            JSON.stringify(barber_id),
            "| Boolean:",
            !!barber_id,
        );

        // Proveri da li je termin vec zauzet (LINIJA 526-534)
        let checkSql, checkParams;
        if (finalBarberId) {
            checkSql =
                "SELECT * FROM appointments WHERE date = ? AND time = ? AND barber_id = ? AND id != ?";
            checkParams = [date, time, finalBarberId, id];
        } else {
            checkSql =
                "SELECT * FROM appointments WHERE date = ? AND time = ? AND id != ?";
            checkParams = [date, time, id];
        }
        console.log("3. Check SQL:", checkSql);
        console.log("   Check params:", checkParams);

        db.query(checkSql, checkParams, (err, results) => {
            if (err) {
                console.error(err);
                process.exit();
                return;
            }
            console.log(
                "4. Existing appointments at same time:",
                results.length > 0 ? "FOUND - would return 409" : "NONE - OK",
            );
            if (results.length > 0) {
                console.log("   Found:", JSON.stringify(results));
            }

            // Ako je dodeljen frizer, proveri radno vreme (LINIJA 546+)
            if (finalBarberId) {
                console.log(
                    "5. Proveravam radno vreme za frizera",
                    finalBarberId,
                );
                db.query(
                    "SELECT work_start, work_end, work_days FROM barbers WHERE id = ?",
                    [finalBarberId],
                    (err, barberResults) => {
                        if (err) {
                            console.error(err);
                            process.exit();
                            return;
                        }
                        console.log(
                            "   Barber data:",
                            JSON.stringify(barberResults),
                        );

                        if (barberResults.length > 0) {
                            const barber = barberResults[0];

                            // Proveri radni dan
                            const dateObj = new Date(date + "T00:00:00");
                            const dayOfWeek = dateObj.getDay();
                            const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;
                            console.log(
                                "6. dayOfWeek:",
                                dayOfWeek,
                                "dbDay:",
                                dbDay,
                            );

                            if (barber.work_days) {
                                const workDays = barber.work_days
                                    .split(",")
                                    .map((d) => d.trim());
                                console.log("   workDays:", workDays);
                                console.log(
                                    "   includes?",
                                    workDays.includes(dbDay.toString()),
                                );
                                if (!workDays.includes(dbDay.toString())) {
                                    console.log(
                                        "   >>> GRESKA: Izabrani frizer ne radi na taj dan",
                                    );
                                }
                            }

                            // Proveri radno vreme
                            if (barber.work_start && barber.work_end) {
                                const [sH, sM] = barber.work_start
                                    .split(":")
                                    .map(Number);
                                const [eH, eM] = barber.work_end
                                    .split(":")
                                    .map(Number);
                                const barberStart = sH * 60 + sM;
                                const barberEnd = eH * 60 + eM;

                                const [newHour, newMinute] = time
                                    .split(":")
                                    .map(Number);
                                const newStartMinutes =
                                    newHour * 60 + newMinute;

                                // Dohvati trajanje usluge
                                db.query(
                                    "SELECT duration FROM services WHERE name = ?",
                                    [service],
                                    (err, durResults) => {
                                        if (err) {
                                            console.error(err);
                                            process.exit();
                                            return;
                                        }
                                        const serviceDuration =
                                            durResults.length > 0
                                                ? durResults[0].duration
                                                : 60;
                                        const newEndMinutes =
                                            newStartMinutes + serviceDuration;

                                        console.log(
                                            "7. barberStart:",
                                            barberStart,
                                            "barberEnd:",
                                            barberEnd,
                                        );
                                        console.log(
                                            "   newStartMinutes:",
                                            newStartMinutes,
                                            "newEndMinutes:",
                                            newEndMinutes,
                                        );
                                        console.log(
                                            "   newStart < barberStart?",
                                            newStartMinutes < barberStart,
                                        );
                                        console.log(
                                            "   newEnd > barberEnd?",
                                            newEndMinutes > barberEnd,
                                        );

                                        if (
                                            newStartMinutes < barberStart ||
                                            newEndMinutes > barberEnd
                                        ) {
                                            console.log(
                                                "   >>> GRESKA: Izabrani frizer ne radi u to vreme",
                                            );
                                        } else {
                                            console.log(
                                                "   >>> OK: U radnom vremenu",
                                            );
                                        }

                                        process.exit();
                                    },
                                );
                            }
                        } else {
                            process.exit();
                        }
                    },
                );
            } else {
                process.exit();
            }
        });
    },
);
