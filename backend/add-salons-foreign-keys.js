// ============================================
// Migracija: Dodaj salon_id u sve tabele
// ============================================
const db = require("./db");

const migrations = [
    // 1. Dodaj salon_id u barbers
    `ALTER TABLE barbers 
     ADD COLUMN salon_id INT DEFAULT 1,
     ADD FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE`,

    // 2. Dodaj salon_id u services
    `ALTER TABLE services 
     ADD COLUMN salon_id INT DEFAULT 1,
     ADD FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE`,

    // 3. Dodaj salon_id u appointments
    `ALTER TABLE appointments 
     ADD COLUMN salon_id INT DEFAULT 1,
     ADD FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE`,

    // 4. Dodaj salon_id u gallery_images
    `ALTER TABLE gallery_images 
     ADD COLUMN salon_id INT DEFAULT 1,
     ADD FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE`,

    // 5. Dodaj salon_id u users
    `ALTER TABLE users 
     ADD COLUMN salon_id INT DEFAULT 1,
     ADD FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE`,
];

async function runMigrations() {
    console.log("Pokrećem migracije za dodavanje salon_id...\n");

    for (let i = 0; i < migrations.length; i++) {
        const sql = migrations[i];
        const tableName = sql.match(/ALTER TABLE (\w+)/)?.[1] || "unknown";
        console.log(
            `[${i + 1}/${migrations.length}] Dodajem salon_id u ${tableName}...`,
        );

        try {
            await new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) {
                        // Ako kolona već postoji, to nije greška
                        if (
                            err.code === "ER_DUP_FIELDNAME" ||
                            err.code === "ER_DUP_KEYNAME"
                        ) {
                            console.log(
                                `  → salon_id već postoji u ${tableName}`,
                            );
                            resolve();
                        } else {
                            reject(err);
                        }
                    } else {
                        console.log(`  → salon_id dodat u ${tableName}`);
                        resolve();
                    }
                });
            });
        } catch (err) {
            console.error(`  ✗ Greška kod ${tableName}:`, err.message);
        }
    }

    console.log("\nMigracije završene!");
    process.exit(0);
}

runMigrations();
