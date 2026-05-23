const db = require("./db");

// Dodaj kolone za radno vreme po frizeru
const alterTableSQL = `
    ALTER TABLE barbers 
    ADD COLUMN IF NOT EXISTS work_days VARCHAR(20) DEFAULT '1,2,3,4,5,6' COMMENT 'Dani u nedelji kada frizer radi (0=ned, 1=pon...)',
    ADD COLUMN IF NOT EXISTS work_start TIME DEFAULT '09:00',
    ADD COLUMN IF NOT EXISTS work_end TIME DEFAULT '17:00'
`;

db.query(alterTableSQL, (err, result) => {
    if (err) {
        console.log("Kolone možda već postoje (greška):", err.message);
    } else {
        console.log("Kolone za radno vreme dodate:", result);
    }

    // Postavi podrazumevano radno vreme za postojeće frizere
    const updateSQL = `
        UPDATE barbers 
        SET work_days = '1,2,3,4,5,6', work_start = '09:00', work_end = '17:00'
        WHERE work_days IS NULL
    `;
    db.query(updateSQL, (err, result) => {
        if (err) {
            console.error("Greška pri ažuriranju:", err);
        } else {
            console.log(
                "Podrazumevano radno vreme postavljeno za",
                result.affectedRows,
                "frizer(a)",
            );
        }
        db.end();
    });
});
