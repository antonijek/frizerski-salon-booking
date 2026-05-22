const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticate, isAdmin } = require("../middleware/auth");

// ============================================
// Services rute - upravljanje uslugama
// ============================================

// Dohvati sve usluge
router.get("/", (req, res) => {
    const sql = "SELECT * FROM services ORDER BY id";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju usluga:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        res.json(results);
    });
});

// Kreiraj novu uslugu (samo admin)
router.post("/", authenticate, isAdmin, (req, res) => {
    const { name, duration, price, description, icon } = req.body;

    if (!name || !duration || !price) {
        return res
            .status(400)
            .json({ error: "Ime, trajanje i cena su obavezni" });
    }

    const sql =
        "INSERT INTO services (name, duration, price, description, icon) VALUES (?, ?, ?, ?, ?)";
    db.query(
        sql,
        [name, duration, price, description || "", icon || "✂️"],
        (err, result) => {
            if (err) {
                console.error("Greška pri kreiranju usluge:", err);
                return res.status(500).json({ error: "Greška na serveru" });
            }
            res.status(201).json({
                id: result.insertId,
                name,
                duration,
                price,
                description: description || "",
                icon: icon || "✂️",
                message: "Usluga uspešno kreirana",
            });
        },
    );
});

// Izmeni uslugu (samo admin)
router.put("/:id", authenticate, isAdmin, (req, res) => {
    const { id } = req.params;
    const { name, duration, price, description, icon } = req.body;

    if (!name || !duration || !price) {
        return res
            .status(400)
            .json({ error: "Ime, trajanje i cena su obavezni" });
    }

    const sql =
        "UPDATE services SET name = ?, duration = ?, price = ?, description = ?, icon = ? WHERE id = ?";
    db.query(
        sql,
        [name, duration, price, description || "", icon || "✂️", id],
        (err, result) => {
            if (err) {
                console.error("Greška pri izmeni usluge:", err);
                return res.status(500).json({ error: "Greška na serveru" });
            }
            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ error: "Usluga nije pronadjena" });
            }
            res.json({ message: "Usluga uspešno izmenjena" });
        },
    );
});

// Obrisi uslugu (samo admin)
router.delete("/:id", authenticate, isAdmin, (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM services WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Greška pri brisanju usluge:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usluga nije pronadjena" });
        }
        res.json({ message: "Usluga uspešno obrisana" });
    });
});

module.exports = router;
