const db = require("./db");

// Kreiraj tabelu za galeriju
const createTable = `
    CREATE TABLE IF NOT EXISTS gallery_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        src VARCHAR(500) NOT NULL,
        alt VARCHAR(200) NOT NULL,
        sort_order INT DEFAULT 0,
        salon_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
`;

db.query(createTable, (err) => {
    if (err) {
        console.error("Greška pri kreiranju tabele:", err);
        process.exit(1);
    }
    console.log("Tabela gallery_images kreirana");

    // Proveri da li ima podataka
    db.query("SELECT COUNT(*) as cnt FROM gallery_images", (err, rows) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        if (rows[0].cnt === 0) {
            // Ubaci pocetne slike
            const insertData = `
                INSERT INTO gallery_images (src, alt, sort_order, salon_id) VALUES
                ('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop', 'Frizura 1', 1, 1),
                ('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop', 'Frizura 2', 2, 1),
                ('https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop', 'Frizura 3', 3, 1),
                ('https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=600&fit=crop', 'Frizura 4', 4, 1),
                ('https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=600&fit=crop', 'Frizura 5', 5, 1),
                ('https://images.unsplash.com/photo-1634302086195-76c43c3e2e4f?w=600&h=600&fit=crop', 'Frizura 6', 6, 1)
            `;
            db.query(insertData, (err) => {
                if (err) {
                    console.error("Greška pri unosu podataka:", err);
                } else {
                    console.log("Početne slike ubacene");
                }
                process.exit();
            });
        } else {
            console.log("Galerija već ima podatke");
            process.exit();
        }
    });
});
