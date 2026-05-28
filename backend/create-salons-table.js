const mysql = require("mysql2");
const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "frizerski_salon",
});

const createTable = `
CREATE TABLE IF NOT EXISTS salons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subdomain VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(100),
    tagline VARCHAR(300),
    description TEXT,
    logo_url VARCHAR(500),
    hero_image_url VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(200),
    address VARCHAR(300),
    working_hours_start TIME DEFAULT '09:00:00',
    working_hours_end TIME DEFAULT '17:00:00',
    working_hours_interval INT DEFAULT 30,
    working_days VARCHAR(50) DEFAULT '1,2,3,4,5,6',
    primary_color VARCHAR(7) DEFAULT '#d97706',
    primary_hover VARCHAR(7) DEFAULT '#b45309',
    primary_light VARCHAR(7) DEFAULT '#fffbeb',
    primary_bg_from VARCHAR(7) DEFAULT '#fef3c7',
    primary_bg_to VARCHAR(7) DEFAULT '#ffedd5',
    neutral_bg VARCHAR(7) DEFAULT '#f9fafb',
    text_primary VARCHAR(7) DEFAULT '#1f2937',
    text_secondary VARCHAR(7) DEFAULT '#6b7280',
    heading_font VARCHAR(100) DEFAULT 'Inter',
    body_font VARCHAR(100) DEFAULT 'Inter',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`;

const insertDefault = `
INSERT INTO salons (subdomain, name, short_name, tagline, description, phone, email, address) VALUES
('main', 'Frizerski Salon', 'Salon', 'Profesionalna nega vaše kose', 'Dobrodošli u naš salon gde vaša kosa dobija najbolju negu.', '+381 61 234 567', 'info@salon.rs', 'Ulica bb, Grad')
ON DUPLICATE KEY UPDATE name=name;
`;

conn.query(createTable, (err) => {
    if (err) {
        console.log("Error creating table:", err.message);
        conn.end();
        return;
    }
    console.log("Salons table created successfully!");

    conn.query(insertDefault, (err2, result) => {
        if (err2) {
            console.log("Error inserting default salon:", err2.message);
            conn.end();
            return;
        }
        console.log("Default salon inserted/verified!");

        conn.query("SELECT * FROM salons", (err3, rows) => {
            if (err3) {
                console.log("Error fetching:", err3.message);
            } else {
                console.log("Salons:", JSON.stringify(rows, null, 2));
            }
            conn.end();
        });
    });
});
