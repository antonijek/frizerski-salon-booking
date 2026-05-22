const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("Greška pri povezivanju sa bazom:", err);
        process.exit(1);
    }
    console.log("Povezan na MySQL bazu");

    // Kreiraj tabelu appointments
    const createAppointmentsTableSql = `
        CREATE TABLE IF NOT EXISTS appointments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            email VARCHAR(100),
            date DATE NOT NULL,
            time TIME NOT NULL,
            service VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_appointment (date, time)
        )
    `;

    db.query(createAppointmentsTableSql, (err) => {
        if (err) {
            console.error("Greška pri kreiranju tabele appointments:", err);
            process.exit(1);
        }
        console.log("Tabela 'appointments' kreirana");

        // Kreiraj tabelu services
        const createServicesTableSql = `
            CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                duration INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                description TEXT,
                icon VARCHAR(10) DEFAULT '✂️',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        db.query(createServicesTableSql, (err) => {
            if (err) {
                console.error("Greška pri kreiranju tabele services:", err);
                process.exit(1);
            }
            console.log("Tabela 'services' kreirana");

            // Ubaci default usluge ako tabela prazna
            const checkServicesSql = "SELECT COUNT(*) as count FROM services";
            db.query(checkServicesSql, (err, results) => {
                if (err) {
                    console.error("Greška:", err);
                    process.exit(1);
                }

                if (results[0].count === 0) {
                    const insertServicesSql =
                        "INSERT INTO services (name, duration, price, description, icon) VALUES ?";
                    const defaultServices = [
                        ["Šišanje", 30, 15.0, "Šišanje po želji", "✂️"],
                        [
                            "Šišanje i feniranje",
                            45,
                            20.0,
                            "Šišanje sa feniranjem",
                            "💇",
                        ],
                        ["Farbanje", 90, 35.0, "Farbanje cele kose", "🎨"],
                        ["Balayage", 120, 50.0, "Tehnika balayage", "✨"],
                        ["Pramenovi", 90, 40.0, "Pramenovi na foliju", "🌟"],
                        ["Feniranje", 30, 12.0, "Samo feniranje", "💨"],
                        ["Peglanje kose", 30, 10.0, "Peglanje kose", "🔧"],
                        ["Šišanje brade", 20, 8.0, "Sređivanje brade", "🧔"],
                    ];
                    db.query(insertServicesSql, [defaultServices], (err) => {
                        if (err) {
                            console.error(
                                "Greška pri dodavanju default usluga:",
                                err,
                            );
                        } else {
                            console.log("Default usluge dodate");
                        }
                    });
                }
            });
        });

        // Kreiraj tabelu users

        const createTableSql = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

        db.query(createTableSql, (err) => {
            if (err) {
                console.error("Greška pri kreiranju tabele:", err);
                process.exit(1);
            }
            console.log("Tabela 'users' kreirana");

            // Kreiraj admin korisnika (ako ne postoji)
            const checkAdminSql =
                "SELECT id FROM users WHERE email = 'admin@salon.com'";
            db.query(checkAdminSql, (err, results) => {
                if (err) {
                    console.error("Greška:", err);
                    process.exit(1);
                }

                if (results.length === 0) {
                    const salt = bcrypt.genSaltSync(10);
                    const hashedPassword = bcrypt.hashSync("admin123", salt);

                    const insertAdminSql =
                        "INSERT INTO users (name, email, password, phone, is_admin) VALUES (?, ?, ?, ?, ?)";
                    db.query(
                        insertAdminSql,
                        [
                            "Admin",
                            "admin@salon.com",
                            hashedPassword,
                            "0600000000",
                            true,
                        ],
                        (err) => {
                            if (err) {
                                console.error(
                                    "Greška pri kreiranju admina:",
                                    err,
                                );
                            } else {
                                console.log("Admin korisnik kreiran:");
                                console.log("  Email: admin@salon.com");
                                console.log("  Lozinka: admin123");
                            }
                            db.end();
                        },
                    );
                } else {
                    console.log("Admin korisnik već postoji");
                    db.end();
                }
            });
        });
    });
});
