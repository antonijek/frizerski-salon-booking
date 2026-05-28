const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticate, isAdmin } = require("../middleware/auth");
const AppError = require("../utils/AppError");

// ============================================
// Services rute - upravljanje uslugama
// ============================================

// Helper: async query wrapper
const query = (sql, params) =>
    new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

// Dohvati sve usluge (salon_id se automatski postavlja iz salonContext middleware-a)
router.get("/", async (req, res, next) => {
    try {
        const salonId = req.salonId;
        const sql = "SELECT * FROM services WHERE salon_id = ? ORDER BY id";
        const results = await query(sql, [salonId]);
        res.json(results);
    } catch (err) {
        console.error("Greška pri dohvatanju usluga:", err);
        return next(new AppError("Greška na serveru", 500));
    }
});

// Kreiraj novu uslugu (samo admin)
router.post("/", authenticate, isAdmin, async (req, res, next) => {
    try {
        const { name, duration, price, description, icon } = req.body;

        if (!name || !duration || !price) {
            return next(new AppError("Ime, trajanje i cena su obavezni", 400));
        }

        const salonId = req.salonId;
        const sql =
            "INSERT INTO services (name, duration, price, description, icon, salon_id) VALUES (?, ?, ?, ?, ?, ?)";
        const result = await query(sql, [
            name,
            duration,
            price,
            description || "",
            icon || "✂️",
            salonId,
        ]);
        res.status(201).json({
            id: result.insertId,
            name,
            duration,
            price,
            description: description || "",
            icon: icon || "✂️",
            message: "Usluga uspešno kreirana",
        });
    } catch (err) {
        console.error("Greška pri kreiranju usluge:", err);
        return next(new AppError("Greška na serveru", 500));
    }
});

// Izmeni uslugu (samo admin)
router.put("/:id", authenticate, isAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, duration, price, description, icon } = req.body;

        if (!name || !duration || !price) {
            return next(new AppError("Ime, trajanje i cena su obavezni", 400));
        }

        const salonId = req.salonId;
        const sql =
            "UPDATE services SET name = ?, duration = ?, price = ?, description = ?, icon = ? WHERE id = ? AND salon_id = ?";
        const result = await query(sql, [
            name,
            duration,
            price,
            description || "",
            icon || "✂️",
            id,
            salonId,
        ]);

        if (result.affectedRows === 0) {
            return next(new AppError("Usluga nije pronadjena", 404));
        }
        res.json({ message: "Usluga uspešno izmenjena" });
    } catch (err) {
        console.error("Greška pri izmeni usluge:", err);
        return next(new AppError("Greška na serveru", 500));
    }
});

// Obrisi uslugu (samo admin)
router.delete("/:id", authenticate, isAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const salonId = req.salonId;
        const sql = "DELETE FROM services WHERE id = ? AND salon_id = ?";
        const result = await query(sql, [id, salonId]);

        if (result.affectedRows === 0) {
            return next(new AppError("Usluga nije pronadjena", 404));
        }
        res.json({ message: "Usluga uspešno obrisana" });
    } catch (err) {
        console.error("Greška pri brisanju usluge:", err);
        return next(new AppError("Greška na serveru", 500));
    }
});

module.exports = router;
