const db = require("./backend/db");

// Simuliramo šta se dešava u backendu za PUT /:id
const id = 1; // neki termin
const date = "2026-05-24";
const time = "14:30";
const service = "Sisanje";
const barber_id = 4; // Cakana Kekic - radi 10:00-18:00

// Prvo dohvati postojeći termin
db.query(
    "SELECT barber_id FROM appointments WHERE id = ?",
    [id],
    (err, existingResults) => {
        if (err) {
            console.error(err);
            process.exit();
            return;
        }
        console.log("Existing:", JSON.stringify(existingResults));

        const existingBarberId = existingResults[0]?.barber_id;
        const finalBarberId = barber_id || existingBarberId;
        console.log("finalBarberId:", finalBarberId);

        // Proveri radno vreme
        db.query(
            "SELECT work_start, work_end, work_days FROM barbers WHERE id = ?",
            [finalBarberId],
            (err, barberResults) => {
                if (err) {
                    console.error(err);
                    process.exit();
                    return;
                }
                console.log("Barber:", JSON.stringify(barberResults));

                if (barberResults.length > 0) {
                    const barber = barberResults[0];

                    // Proveri radni dan
                    const dateObj = new Date(date + "T00:00:00");
                    const dayOfWeek = dateObj.getDay();
                    const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;
                    console.log("dayOfWeek:", dayOfWeek, "dbDay:", dbDay);

                    if (barber.work_days) {
                        const workDays = barber.work_days
                            .split(",")
                            .map((d) => d.trim());
                        console.log("workDays:", workDays);
                        console.log(
                            "includes?",
                            workDays.includes(dbDay.toString()),
                        );
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

                        console.log(
                            "barberStart:",
                            barberStart,
                            "barberEnd:",
                            barberEnd,
                        );
                        console.log("newStartMinutes:", newStartMinutes);
                        console.log(
                            "newStart < barberStart?",
                            newStartMinutes < barberStart,
                        );
                        console.log(
                            "newEnd > barberEnd?",
                            newStartMinutes + 60 > barberEnd,
                        );

                        if (
                            newStartMinutes < barberStart ||
                            newStartMinutes + 60 > barberEnd
                        ) {
                            console.log("GRESKA: Van radnog vremena!");
                        } else {
                            console.log("OK: U radnom vremenu");
                        }
                    }
                }
                process.exit();
            },
        );
    },
);
