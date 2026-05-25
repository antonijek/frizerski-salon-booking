const db = require("./backend/db");

// Testiraj razlicite periode
const queries = [
    {
        name: "Week",
        sql: "SELECT COUNT(*) as total FROM appointments a WHERE a.date >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL 7 DAY) AND a.date <= DATE_FORMAT(NOW(), '%Y-%m-%d')",
    },
    {
        name: "Month",
        sql: "SELECT COUNT(*) as total FROM appointments a WHERE a.date >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL 1 MONTH) AND a.date <= DATE_FORMAT(NOW(), '%Y-%m-%d')",
    },
    {
        name: "Year",
        sql: "SELECT COUNT(*) as total FROM appointments a WHERE a.date >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-%d'), INTERVAL 1 YEAR) AND a.date <= DATE_FORMAT(NOW(), '%Y-%m-%d')",
    },
    {
        name: "All time",
        sql: "SELECT COUNT(*) as total FROM appointments",
    },
    {
        name: "Today",
        sql: "SELECT COUNT(*) as count FROM appointments WHERE date = DATE_FORMAT(NOW(), '%Y-%m-%d')",
    },
];

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
            console.log(
                q.name + " total:",
                results[0].total !== undefined
                    ? results[0].total
                    : results[0].count,
            );
        }
        idx++;
        runNext();
    });
}
runNext();
