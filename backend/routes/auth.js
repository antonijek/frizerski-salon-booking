const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { authenticate, isAdmin } = require("../middleware/auth");

// ============================================
// Auth rute - registracija i prijava
// ============================================

/**
 * POST /api/auth/register - Registracija novog korisnika
 */
router.post("/register", (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
        return res
            .status(400)
            .json({ error: "Ime, email i lozinka su obavezni" });
    }

    // Proveri da li email vec postoji
    const checkSql = "SELECT id FROM users WHERE email = ?";
    db.query(checkSql, [email], (err, results) => {
        if (err) {
            console.error("Greška pri proveri email-a:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: "Email je već registrovan" });
        }

        // Hesiraj lozinku
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const sql =
            "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)";
        db.query(
            sql,
            [name, email, hashedPassword, phone || null],
            (err, result) => {
                if (err) {
                    console.error("Greška pri registraciji:", err);
                    return res.status(500).json({ error: "Greška na serveru" });
                }

                // Kreiraj token
                const token = jwt.sign(
                    {
                        id: result.insertId,
                        email,
                        name,
                        isAdmin: false,
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: "7d" },
                );

                res.status(201).json({
                    token,
                    user: {
                        id: result.insertId,
                        name,
                        email,
                        phone: phone || "",
                        isAdmin: false,
                    },
                });
            },
        );
    });
});

/**
 * POST /api/auth/login - Prijava korisnika
 */
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email i lozinka su obavezni" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("Greška pri prijavi:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }

        if (results.length === 0) {
            return res
                .status(401)
                .json({ error: "Pogrešan email ili lozinka" });
        }

        const user = results[0];

        // Proveri lozinku
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res
                .status(401)
                .json({ error: "Pogrešan email ili lozinka" });
        }

        // Kreiraj token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.is_admin === 1,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" },
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || "",
                isAdmin: user.is_admin === 1,
            },
        });
    });
});

/**
 * GET /api/auth/me - Dohvati podatke o trenutnom korisniku
 */
router.get("/me", authenticate, (req, res) => {
    const sql =
        "SELECT id, name, email, phone, is_admin FROM users WHERE id = ?";
    db.query(sql, [req.user.id], (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju korisnika:", err);
            return res.status(500).json({ error: "Greška na serveru" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Korisnik nije pronadjen" });
        }

        const user = results[0];
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            isAdmin: user.is_admin === 1,
        });
    });
});

/**
 * POST /api/auth/make-admin - Postavi korisnika za admina (samo za prvog admina)
 */
router.post("/make-admin", authenticate, (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email je obavezan" });
    }

    // Proveri da li je korisnik koji zahteva vec admin
    const checkSql = "SELECT is_admin FROM users WHERE id = ?";
    db.query(checkSql, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Greška na serveru" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Korisnik nije pronadjen" });
        }

        // Ako korisnik nije admin, dozvoli samo ako nema admina u bazi
        if (!results[0].is_admin) {
            const adminCheck =
                "SELECT COUNT(*) as count FROM users WHERE is_admin = 1";
            db.query(adminCheck, (err2, adminResults) => {
                if (err2) {
                    return res.status(500).json({ error: "Greška na serveru" });
                }
                if (adminResults[0].count > 0) {
                    return res
                        .status(403)
                        .json({
                            error: "Već postoji admin. Samo admin može dodati novog admina.",
                        });
                }
                // Nema admina - dozvoli
                makeAdmin(email, res);
            });
        } else {
            // Korisnik je admin - dozvoli
            makeAdmin(email, res);
        }
    });
});

function makeAdmin(email, res) {
    const sql = "UPDATE users SET is_admin = 1 WHERE email = ?";
    db.query(sql, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Greška na serveru" });
        }
        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ error: "Korisnik sa tim email-om nije pronadjen" });
        }
        res.json({
            success: true,
            message: "Korisnik je postavljen za admina",
        });
    });
}

module.exports = router;
