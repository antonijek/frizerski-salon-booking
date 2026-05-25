const db = require("./backend/db");

db.query(
    "SELECT DATE_FORMAT(NOW(), '%Y-%m-%d') as today_str, NOW() as now, CURDATE() as curdate, DATE(NOW()) as date_now",
    (err, results) => {
        if (err) {
            console.error("Error:", err);
            process.exit(1);
        }
        const r = results[0];
        console.log("DATE_FORMAT(NOW()):", r.today_str);
        console.log("NOW():", r.now);
        console.log("CURDATE():", r.curdate);
        console.log("DATE(NOW()):", r.date_now);
        process.exit();
    },
);
