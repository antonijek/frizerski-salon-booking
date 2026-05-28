const mysql = require("mysql2");
const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "frizerski_salon",
});

conn.query("SHOW TABLES", (err, rows) => {
    if (err) {
        console.log("Error:", err.message);
        return;
    }
    console.log("Tables:", rows.map((r) => Object.values(r)[0]).join(", "));

    conn.query("SELECT * FROM salons", (err2, rows2) => {
        if (err2) {
            console.log("Salons error:", err2.message);
            return;
        }
        console.log("Salons:", JSON.stringify(rows2, null, 2));
        conn.end();
    });
});
