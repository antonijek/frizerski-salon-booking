const express = require("express");
const router = express.Router();
const db = require("../db");

// Dohvati sve termine
router.get("/", (req, res) => {
    const sql = "SELECT * FROM appointments ORDER BY date, time";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        res.json(results);
    });
});

// Dohvati termine za odredjeni datum
router.get("/date/:date", (req, res) => {
    const { date } = req.params;
    const sql = "SELECT * FROM appointments WHERE date = ? ORDER BY time";
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
    const sql =
        "SELECT * FROM appointments WHERE phone = ? ORDER BY date DESC, time DESC";
    db.query(sql, [phone], (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        res.json(results);
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

// Obrisi termin
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM appointments WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Greška pri brisanju termina:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Termin nije pronadjen" });
        }
        res.json({ message: "Termin uspešno obrisan" });
    });
});

module.exports = router;
