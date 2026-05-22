const express = require("express");
const router = express.Router();
const db = require("../db");
const {
    sendSalonNotification,
    sendCustomerConfirmation,
    sendCancellationNotification,
} = require("../emailService");

// Dohvati sve termine (sa cenom usluge)
router.get("/", (req, res) => {
    const sql =
        "SELECT a.id, a.name, a.phone, a.email, DATE_FORMAT(a.date, '%Y-%m-%d') as date, a.time, a.service, s.price, a.created_at FROM appointments a LEFT JOIN services s ON a.service = s.name ORDER BY a.date, a.time";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        res.json(results);
    });
});

// Dohvati termine za odredjeni datum (sa trajanjem usluge)
router.get("/date/:date", (req, res) => {
    const { date } = req.params;
    const sql =
        "SELECT a.id, a.name, a.phone, a.email, DATE_FORMAT(a.date, '%Y-%m-%d') as date, a.time, a.service, s.duration FROM appointments a LEFT JOIN services s ON a.service = s.name WHERE a.date = ? ORDER BY a.time";
    db.query(sql, [date], (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        res.json(results);
    });
});

// Dohvati termine po broju telefona
router.get("/phone/:phone", (req, res) => {
    const { phone } = req.params;
    // Ukloni sve ne-cifre iz broja za pretragu
    const cleanPhone = phone.replace(/\D/g, "");
    // Uzmi poslednjih 6+ cifara za SQL pretragu (da nadje i formate sa pozivnim)
    const searchSuffix = cleanPhone.slice(-8);
    const sql =
        "SELECT id, name, phone, email, DATE_FORMAT(date, '%Y-%m-%d') as date, time, service, created_at FROM appointments ORDER BY date DESC, time DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        // Filtriraj rezultate - poredimo samo cifre
        // Npr. ako je u bazi +38267551384, a korisnik unese 067551384,
        // treba da se poklopi jer oba imaju "67551384" na kraju
        const filtered = results.filter((a) => {
            const dbClean = a.phone.replace(/\D/g, "");
            // Ukloni vodeće nule iz oba broja
            const dbTrimmed = dbClean.replace(/^0+/, "");
            const inputTrimmed = cleanPhone.replace(/^0+/, "");
            // Proveri da li se duži broj završava sa kraćim
            // (npr. 38267551384 se završava sa 67551384, a 067551384 bez nule je 67551384)
            const longer =
                dbTrimmed.length >= inputTrimmed.length
                    ? dbTrimmed
                    : inputTrimmed;
            const shorter =
                dbTrimmed.length >= inputTrimmed.length
                    ? inputTrimmed
                    : dbTrimmed;
            return longer.endsWith(shorter);
        });
        res.json(filtered);
    });
});

// Kreiraj novi termin
router.post("/", (req, res) => {
    const { name, phone, email, date, time, service } = req.body;

    if (!name || !phone || !date || !time || !service) {
        return res.status(400).json({ error: "Sva polja su obavezna" });
    }

    // Proveri da li je termin vec zauzet
    const checkSql = "SELECT * FROM appointments WHERE date = ? AND time = ?";
    db.query(checkSql, [date, time], (err, results) => {
        if (err) {
            console.error("Greška pri proveri termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: "Termin je već zauzet" });
        }

        const sql =
            "INSERT INTO appointments (name, phone, email, date, time, service) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(
            sql,
            [name, phone, email, date, time, service],
            (err, result) => {
                if (err) {
                    console.error("Greška pri kreiranju termina:", err);
                    return res.status(500).json({ error: "Greška na serveru" });
                }
                // Posalji mejlove
                const appointment = { name, phone, email, date, time, service };
                sendSalonNotification(appointment);
                sendCustomerConfirmation(appointment);

                res.status(201).json({
                    id: result.insertId,
                    message: "Termin uspešno kreiran",
                });
            },
        );
    });
});

// Izmeni termin
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, phone, email, date, time, service } = req.body;

    if (!name || !phone || !date || !time || !service) {
        return res.status(400).json({ error: "Sva polja su obavezna" });
    }

    // Proveri da li je novi termin vec zauzet (osim ako je isti termin)
    const checkSql =
        "SELECT * FROM appointments WHERE date = ? AND time = ? AND id != ?";
    db.query(checkSql, [date, time, id], (err, results) => {
        if (err) {
            console.error("Greška pri proveri termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: "Termin je već zauzet" });
        }

        const sql =
            "UPDATE appointments SET name = ?, phone = ?, email = ?, date = ?, time = ?, service = ? WHERE id = ?";
        db.query(
            sql,
            [name, phone, email, date, time, service, id],
            (err, result) => {
                if (err) {
                    console.error("Greška pri izmeni termina:", err);
                    return res.status(500).json({ error: "Greška na serveru" });
                }
                if (result.affectedRows === 0) {
                    return res
                        .status(404)
                        .json({ error: "Termin nije pronadjen" });
                }
                res.json({ message: "Termin uspešno izmenjen" });
            },
        );
    });
});

// Obrisi termin (sa slanjem mejla o otkazivanju)
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    // Prvo dohvati podatke o terminu da bismo poslali mejl
    const getSql =
        "SELECT id, name, phone, email, DATE_FORMAT(date, '%Y-%m-%d') as date, time, service FROM appointments WHERE id = ?";
    db.query(getSql, [id], (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Termin nije pronadjen" });
        }

        const appointment = results[0];

        // Obrisi termin
        const deleteSql = "DELETE FROM appointments WHERE id = ?";
        db.query(deleteSql, [id], (err, result) => {
            if (err) {
                console.error("Greška pri brisanju termina:", err);
                return res.status(500).json({ error: "Greška na serveru" });
            }

            // Posalji mejlove o otkazivanju
            sendCancellationNotification(appointment);

            res.json({ message: "Termin uspešno obrisan" });
        });
    });
});

module.exports = router;
