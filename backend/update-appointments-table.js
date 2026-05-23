const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "frizerski_salon",
    multipleStatements: true,
});

const sql = `
-- Dodaj barber_id kolonu ako ne postoji
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = '${process.env.DB_NAME || "frizerski_salon"}' AND TABLE_NAME = 'appointments' AND COLUMN_NAME = 'barber_id');
SET @sql := IF(@exist = 0, 'ALTER TABLE appointments ADD COLUMN barber_id INT DEFAULT NULL AFTER service, ADD FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Obriši stari unique key i dodaj novi sa barber_id
ALTER TABLE appointments DROP INDEX IF EXISTS unique_appointment;
ALTER TABLE appointments ADD UNIQUE INDEX unique_appointment (date, time, barber_id);
`;

connection.query(sql, (err) => {
    if (err) {
        console.error("Greška:", err);
    } else {
        console.log("Tabela appointments ažurirana - dodata barber_id kolona!");
    }
    connection.end();
});
