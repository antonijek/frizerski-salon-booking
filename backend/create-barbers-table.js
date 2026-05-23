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
CREATE TABLE IF NOT EXISTS barbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO barbers (name) VALUES ('Marko'), ('Jovana'), ('Ana');
`;

connection.query(sql, (err) => {
    if (err) {
        console.error("Greška:", err);
    } else {
        console.log("Tabela barbers kreirana i podaci dodati!");
    }
    connection.end();
});
