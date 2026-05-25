const db = require("./backend/db");

// Testiraj novu logiku - tekuci periodi
const queries = [
    {
        name: "Week (current week Mon-Sun)",
        sql: "SELECT COUNT(*) as total FROM appointments a WHERE a.date >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL WEEKDAY(NOW()) DAY) AND a.date <= DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL (6 - WEEKDAY(NOW())) DAY)",
    },
    {
        name: "Month (current month)",
        sql: "SELECT COUNT(*) as total FROM appointments a WHERE a.date >= DATE_FORMAT(NOW(), '%Y-%m-01') AND a.date <= LAST_DAY(DATE_FORMAT(NOW(), '%Y-%m-%d'))",
    },
    {
        name: "Year (current year)",
        sql: "SELECT COUNT(*) as total FROM appointments a WHERE a.date >= DATE_FORMAT(NOW(), '%Y-01-01') AND a.date <= DATE_FORMAT(NOW(), '%Y-12-31')",
    },
    {
        name: "All time",
        sql: "SELECT COUNT(*) as total FROM appointments",
    },
];

// Prvo proveri koji je danas dan i koje datume pokrivaju ovi periodi
db.query(
    "SELECT DATE_FORMAT(NOW(), '%Y-%m-%d') as today, WEEKDAY(NOW()) as weekday, DATE_FORMAT(NOW(), '%Y-%m') as month, DATE_FORMAT(NOW(), '%Y') as year",
    (err, info) => {
        console.log(
            "Today:",
            info[0].today,
            "(weekday:",
            info[0].weekday,
            "= Monday=0)",
        );
        console.log("Current month:", info[0].month);
        console.log("Current year:", info[0].year);
        console.log("");

        let idx = 0;
        function runNext() {
            if (idx >= queries.length) {
                process.exit();
                return;
            }
            const q = queries[idx];
            db.query(q.sql, (err, results) => {
                if (err) {
                    console.error(q.name + " error:", err.message);
                } else {
                    console.log(q.name + ":", results[0].total);
                }
                idx++;
                runNext();
            });
        }
        runNext();
    },
);
