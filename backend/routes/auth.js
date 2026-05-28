const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { authenticate, isAdmin, isSuperAdmin } = require("../middleware/auth");
const AppError = require("../utils/AppError");

// Helper: async query wrapper
const query = (sql, params) =>
    new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

// ============================================
// Auth rute - registracija i prijava
// ============================================

/**
 * POST /api/auth/register - Registracija novog korisnika
 * Salon_id se automatski postavlja iz subdomain-a (salonContext middleware)
 */
router.post("/register", async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;
        const salon_id = req.salonId;

        if (!name || !email || !password) {
            return next(new AppError("Ime, email i lozinka su obavezni", 400));
        }

        // Proveri da li email vec postoji (u okviru istog salona)
        const checkResults = await query(
            "SELECT id FROM users WHERE email = ? AND salon_id = ?",
            [email, salon_id],
        );

        if (checkResults.length > 0) {
            return next(new AppError("Email je već registrovan", 409));
        }

        // Hesiraj lozinku
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const result = await query(
            "INSERT INTO users (name, email, password, phone, salon_id) VALUES (?, ?, ?, ?, ?)",
            [name, email, hashedPassword, phone || null, salon_id],
        );

        // Kreiraj token
        const token = jwt.sign(
            {
                id: result.insertId,
                email,
                name,
                isAdmin: false,
                isSuperAdmin: false,
                salon_id,
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
                isSuperAdmin: false,
                salon_id,
            },
        });
    } catch (err) {
        console.error("Greška pri registraciji:", err);
        return next(new AppError("Greška na serveru", 500));
    }
});

/**
 * POST /api/auth/login - Prijava korisnika
 */
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const salon_id = req.salonId;

        if (!email || !password) {
            return next(new AppError("Email i lozinka su obavezni", 400));
        }

        const results = await query(
            "SELECT * FROM users WHERE email = ? AND salon_id = ?",
            [email, salon_id],
        );

        if (results.length === 0) {
            return next(new AppError("Pogrešan email ili lozinka", 401));
        }

        const user = results[0];

        // Proveri lozinku
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return next(new AppError("Pogrešan email ili lozinka", 401));
        }

        // Kreiraj token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.is_admin === 1,
                isSuperAdmin: user.is_super_admin === 1,
                salon_id: user.salon_id,
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
                isSuperAdmin: user.is_super_admin === 1,
                salon_id: user.salon_id,
            },
        });
    } catch (err) {
        console.error("Greška pri prijavi:", err);
        return next(new AppError("Greška na serveru", 500));
    }
});

/**
 * GET /api/auth/me - Dohvati podatke o trenutnom korisniku
 */
router.get("/me", authenticate, async (req, res, next) => {
    try {
        const results = await query(
            "SELECT id, name, email, phone, is_admin, is_super_admin, salon_id FROM users WHERE id = ?",
            [req.user.id],
        );

        if (results.length === 0) {
            return next(new AppError("Korisnik nije pronadjen", 404));
        }

        const user = results[0];
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            isAdmin: user.is_admin === 1,
            isSuperAdmin: user.is_super_admin === 1,
            salon_id: user.salon_id,
        });
    } catch (err) {
        console.error("Greška pri dohvatanju korisnika:", err);
        return next(new AppError("Greška na serveru", 500));
    }
});

/**
 * POST /api/auth/make-admin - Postavi korisnika za admina (samo za prvog admina)
 */
router.post("/make-admin", authenticate, async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(new AppError("Email je obavezan", 400));
        }

        // Proveri da li je korisnik koji zahteva vec admin
        const results = await query("SELECT is_admin FROM users WHERE id = ?", [
            req.user.id,
        ]);

        if (results.length === 0) {
            return next(new AppError("Korisnik nije pronadjen", 404));
        }

        // Ako korisnik nije admin, dozvoli samo ako nema admina u bazi
        if (!results[0].is_admin) {
            const adminResults = await query(
                "SELECT COUNT(*) as count FROM users WHERE is_admin = 1",
            );
            if (adminResults[0].count > 0) {
                return next(
                    new AppError(
                        "Već postoji admin. Samo admin može dodati novog admina.",
                        403,
                    ),
                );
            }
            // Nema admina - dozvoli
        }

        // Korisnik je admin (ili nema admina) - dozvoli
        const result = await query(
            "UPDATE users SET is_admin = 1 WHERE email = ?",
            [email],
        );

        if (result.affectedRows === 0) {
            return next(
                new AppError("Korisnik sa tim email-om nije pronadjen", 404),
            );
        }

        res.json({
            success: true,
            message: "Korisnik je postavljen za admina",
        });
    } catch (err) {
        console.error("Greška pri postavljanju admina:", err);
        return next(new AppError("Greška na serveru", 500));
    }
});

/**
 * GET /api/auth/users - Dohvati sve korisnike (samo admin)
 * Super admin vidi korisnike svih salona preko query parametra
 */
router.get("/users", authenticate, isAdmin, async (req, res, next) => {
    try {
        const salon_id = req.query.salon_id || req.salonId;

        const results = await query(
            "SELECT id, name, email, phone, is_admin, salon_id, created_at FROM users WHERE salon_id = ? ORDER BY created_at DESC",
            [salon_id],
        );

        res.json(results);
    } catch (err) {
        console.error("Greška pri dohvatanju korisnika:", err);
        return next(new AppError("Greška na serveru", 500));
    }
});

/**
 * PUT /api/auth/users/:id - Izmeni korisnika (samo admin)
 */
router.put("/users/:id", authenticate, isAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, phone, is_admin } = req.body;
        const salon_id = req.salonId;

        if (!name || !email) {
            return next(new AppError("Ime i email su obavezni", 400));
        }

        const result = await query(
            "UPDATE users SET name = ?, email = ?, phone = ?, is_admin = ? WHERE id = ? AND salon_id = ?",
            [name, email, phone || null, is_admin ? 1 : 0, id, salon_id],
        );

        if (result.affectedRows === 0) {
            return next(new AppError("Korisnik nije pronadjen", 404));
        }

        res.json({ message: "Korisnik uspešno izmenjen" });
    } catch (err) {
        console.error("Greška pri izmeni korisnika:", err);
        return next(new AppError("Greška na serveru", 500));
    }
});

/**
 * DELETE /api/auth/users/:id - Obriši korisnika (samo admin)
 */
router.delete("/users/:id", authenticate, isAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const salon_id = req.salonId;

        // Ne dozvoli brisanje samog sebe
        if (parseInt(id) === req.user.id) {
            return next(new AppError("Ne možete obrisati sami sebe", 400));
        }

        const result = await query(
            "DELETE FROM users WHERE id = ? AND salon_id = ?",
            [id, salon_id],
        );

        if (result.affectedRows === 0) {
            return next(new AppError("Korisnik nije pronadjen", 404));
        }

        res.json({ message: "Korisnik uspešno obrisan" });
    } catch (err) {
        console.error("Greška pri brisanju korisnika:", err);
        return next(new AppError("Greška na serveru", 500));
    }
});

/**
 * POST /api/auth/make-super-admin - Postavi korisnika za super admina (samo super admin)
 */
router.post(
    "/make-super-admin",
    authenticate,
    isSuperAdmin,
    async (req, res, next) => {
        try {
            const { email } = req.body;

            if (!email) {
                return next(new AppError("Email je obavezan", 400));
            }

            const result = await query(
                "UPDATE users SET is_super_admin = 1, is_admin = 1 WHERE email = ?",
                [email],
            );

            if (result.affectedRows === 0) {
                return next(
                    new AppError(
                        "Korisnik sa tim email-om nije pronadjen",
                        404,
                    ),
                );
            }

            res.json({
                success: true,
                message: "Korisnik je postavljen za super admina",
            });
        } catch (err) {
            console.error("Greška pri postavljanju super admina:", err);
            return next(new AppError("Greška na serveru", 500));
        }
    },
);

/**
 * GET /api/auth/super-admin/users - Dohvati sve korisnike iz svih salona (samo super admin)
 */
router.get(
    "/super-admin/users",
    authenticate,
    isSuperAdmin,
    async (req, res, next) => {
        try {
            const results = await query(
                "SELECT u.id, u.name, u.email, u.phone, u.is_admin, u.is_super_admin, u.salon_id, u.created_at, s.name as salon_name FROM users u LEFT JOIN salons s ON u.salon_id = s.id ORDER BY u.created_at DESC",
            );

            res.json(results);
        } catch (err) {
            console.error("Greška pri dohvatanju korisnika:", err);
            return next(new AppError("Greška na serveru", 500));
        }
    },
);

// ============================================
// Super Admin Switch Context rute
// ============================================

/**
 * POST /api/auth/switch-salon/:id - Super admin prelazi u admin panel konkretnog salona
 * Generiše novi JWT sa switchedSalonId koji salonContext middleware detektuje
 */
router.post(
    "/switch-salon/:id",
    authenticate,
    isSuperAdmin,
    async (req, res, next) => {
        try {
            const targetSalonId = parseInt(req.params.id);

            // Proveri da li salon postoji
            const salons = await query(
                "SELECT id, name, subdomain, is_active FROM salons WHERE id = ?",
                [targetSalonId],
            );

            if (salons.length === 0) {
                return next(new AppError("Salon nije pronađen", 404));
            }

            const salon = salons[0];

            if (!salon.is_active) {
                return next(new AppError("Salon nije aktivan", 400));
            }

            // Kreiraj novi token sa switchedSalonId
            // Zadržavamo originalne super admin podatke + switchedSalonId
            const token = jwt.sign(
                {
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                    isAdmin: true, // Super admin ima admin prava u svakom salonu
                    isSuperAdmin: true,
                    salon_id: req.user.salon_id, // Originalni salon_id super admina
                    switchedSalonId: targetSalonId, // Override za salonContext
                    switchedSalonName: salon.name,
                },
                process.env.JWT_SECRET,
                { expiresIn: "7d" },
            );

            res.json({
                token,
                salon: {
                    id: salon.id,
                    name: salon.name,
                    subdomain: salon.subdomain,
                },
                message: `Prešli ste u salon "${salon.name}"`,
            });
        } catch (err) {
            console.error("Greška pri prelasku u salon:", err);
            return next(new AppError("Greška na serveru", 500));
        }
    },
);

/**
 * POST /api/auth/switch-back - Super admin se vraća u super admin režim
 * Generiše normalan JWT bez switchedSalonId
 */
router.post(
    "/switch-back",
    authenticate,
    isSuperAdmin,
    async (req, res, next) => {
        try {
            // Kreiraj normalan token bez switchedSalonId
            const token = jwt.sign(
                {
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                    isAdmin: true,
                    isSuperAdmin: true,
                    salon_id: req.user.salon_id,
                },
                process.env.JWT_SECRET,
                { expiresIn: "7d" },
            );

            res.json({
                token,
                message: "Vraćeni ste u super admin režim",
            });
        } catch (err) {
            console.error("Greška pri vraćanju u super admin režim:", err);
            return next(new AppError("Greška na serveru", 500));
        }
    },
);

module.exports = router;
