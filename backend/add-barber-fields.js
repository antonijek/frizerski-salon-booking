const db = require("./db");

// Dodavanje kolona za sliku, titulu i bio u barbers tabelu
const sql = `
    ALTER TABLE barbers
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) DEFAULT NULL AFTER name,
    ADD COLUMN IF NOT EXISTS title VARCHAR(100) DEFAULT NULL AFTER image_url,
    ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL AFTER title
`;

db.query(sql, (err, result) => {
    if (err) {
        console.error("Greška pri dodavanju kolona:", err);
        process.exit(1);
    }
    console.log("Kolone image_url, title, bio uspešno dodate u barbers tabelu");
    process.exit(0);
});
