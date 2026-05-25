const db = require("./backend/db");

// Proveri sta je u bazi
db.query(
    "SELECT id, DATE_FORMAT(date, '%Y-%m-%d') as date_str, date as raw_date, time, service FROM appointments ORDER BY date",
    (err, results) => {
        if (err) {
            console.error("Error:", err.message);
            process.exit();
            return;
        }
        console.log("Appointments in DB:");
        results.forEach((r) => {
            console.log(
                `  id=${r.id} date_str=${r.date_str} raw_date=${r.raw_date} time=${r.time} service=${r.service}`,
            );
        });

        // Proveri sta DATE_FORMAT(NOW()) vraca
        db.query(
            "SELECT DATE_FORMAT(NOW(), '%Y-%m-%d') as today",
            (err2, r2) => {
                console.log("\nToday (DATE_FORMAT):", r2[0].today);

                // Proveri koji datumi su >= pre 7 dana
                db.query(
                    "SELECT DISTINCT DATE_FORMAT(date, '%Y-%m-%d') as d FROM appointments WHERE date >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL 7 DAY) AND date <= DATE_FORMAT(NOW(), '%Y-%m-%d') ORDER BY d",
                    (err3, r3) => {
                        console.log("\nDates in week range:");
                        r3.forEach((r) => console.log("  ", r.d));
                        process.exit();
                    },
                );
            },
        );
    },
);
