const mysql = require("mysql2");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
    timezone: "+02:00",
});

db.connect((err) => {
    if (err) {
        console.error("Greška pri povezivanju sa bazom:", err);
        return;
    }
    console.log("Povezan na MySQL bazu");
});

module.exports = db;
