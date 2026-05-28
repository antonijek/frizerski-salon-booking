const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../utils/AppError");
let sharp = null;
try {
    sharp = require("sharp");
} catch (e) {
    console.log("Sharp nije dostupan - optimizacija slika preskočena");
}
const { authenticate, isSuperAdmin } = require("../middleware/auth");

const query = (sql, params) =>
    new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

// ============================================
// Multer konfiguracija za upload hero slike
// ============================================

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `hero-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Dozvoljeni su samo JPG, PNG, GIF i WebP fajlovi"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// ============================================
// Salons API rute (multi-tenant)
// ============================================

/**
 * GET /api/salons - Dohvati salon po subdomain-u (ili podrazumevani)
 */
router.get("/", async (req, res, next) => {
    try {
        const subdomain = req.query.subdomain || "main";
        const sql =
            "SELECT * FROM salons WHERE subdomain = ? AND is_active = TRUE LIMIT 1";
        const results = await query(sql, [subdomain]);

        if (results.length === 0) {
            throw new AppError("Salon nije pronađen", 404);
        }

        res.json(results[0]);
    } catch (err) {
        if (err.isOperational) return next(err);
        console.error("Greška pri dohvatanju salona:", err);
        next(new AppError("Greška pri dohvatanju salona", 500));
    }
});

/**
 * GET /api/salons/all - Dohvati sve salone (admin)
 */
router.get("/all", authenticate, isSuperAdmin, async (req, res, next) => {
    try {
        const sql = `
            SELECT
                s.id, s.subdomain, s.name, s.short_name, s.is_active, s.created_at,
                (SELECT COUNT(*) FROM barbers WHERE salon_id = s.id) as barber_count,
                (SELECT COUNT(*) FROM services WHERE salon_id = s.id) as service_count,
                (SELECT COUNT(*) FROM appointments WHERE salon_id = s.id) as appointment_count,
                (SELECT COUNT(*) FROM users WHERE salon_id = s.id) as user_count
            FROM salons s ORDER BY s.name
        `;
        const results = await query(sql);
        res.json(results);
    } catch (err) {
        console.error("Greška pri dohvatanju salona:", err);
        next(new AppError("Greška pri dohvatanju salona", 500));
    }
});

/**
 * POST /api/salons - Kreiraj novi salon (admin)
 */
router.post("/", authenticate, isSuperAdmin, async (req, res, next) => {
    try {
        const { subdomain, name, short_name } = req.body;

        if (!subdomain || !name) {
            throw new AppError("Subdomain i ime su obavezni", 400);
        }

        // Proveri da li subdomain već postoji
        const checkResults = await query(
            "SELECT id FROM salons WHERE subdomain = ?",
            [subdomain],
        );
        if (checkResults.length > 0) {
            throw new AppError("Subdomain već postoji", 409);
        }

        const sql =
            "INSERT INTO salons (subdomain, name, short_name, is_active) VALUES (?, ?, ?, TRUE)";
        const result = await query(sql, [subdomain, name, short_name || name]);

        res.status(201).json({
            success: true,
            message: "Salon uspešno kreiran",
            salon: {
                id: result.insertId,
                subdomain,
                name,
                short_name: short_name || name,
                is_active: true,
            },
        });
    } catch (err) {
        if (err.isOperational) return next(err);
        console.error("Greška pri kreiranju salona:", err);
        next(new AppError("Greška pri kreiranju salona", 500));
    }
});

/**
 * DELETE /api/salons/:id - Obriši salon (admin)
 */
router.delete("/:id", authenticate, isSuperAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;

        // Ne dozvoli brisanje glavnog salona
        const checkResults = await query(
            "SELECT subdomain FROM salons WHERE id = ?",
            [id],
        );
        if (checkResults.length === 0) {
            throw new AppError("Salon nije pronađen", 404);
        }
        if (checkResults[0].subdomain === "main") {
            throw new AppError("Ne možete obrisati glavni salon", 400);
        }

        await query("DELETE FROM salons WHERE id = ?", [id]);
        res.json({ success: true, message: "Salon uspešno obrisan" });
    } catch (err) {
        if (err.isOperational) return next(err);
        console.error("Greška pri brisanju salona:", err);
        next(new AppError("Greška pri brisanju salona", 500));
    }
});

/**
 * PUT /api/salons/:id - Izmeni salon (admin)
 */
router.put("/:id", authenticate, async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            throw new AppError("Nemaš dozvolu", 403);
        }

        const { id } = req.params;
        const {
            name,
            short_name,
            tagline,
            description,
            logo_url,
            hero_image_url,
            phone,
            email,
            address,
            working_hours_start,
            working_hours_end,
            working_hours_interval,
            working_days,
            primary_color,
            primary_hover,
            primary_light,
            primary_bg_from,
            primary_bg_to,
            neutral_bg,
            text_primary,
            text_secondary,
            heading_font,
            body_font,
        } = req.body;

        const sql = `UPDATE salons SET 
            name = ?, short_name = ?, tagline = ?, description = ?,
            logo_url = ?, hero_image_url = ?,
            phone = ?, email = ?, address = ?,
            working_hours_start = ?, working_hours_end = ?, working_hours_interval = ?, working_days = ?,
            primary_color = ?, primary_hover = ?, primary_light = ?,
            primary_bg_from = ?, primary_bg_to = ?,
            neutral_bg = ?, text_primary = ?, text_secondary = ?,
            heading_font = ?, body_font = ?
            WHERE id = ?`;

        const result = await query(sql, [
            name || null,
            short_name || null,
            tagline || null,
            description || null,
            logo_url || null,
            hero_image_url || null,
            phone || null,
            email || null,
            address || null,
            working_hours_start || "09:00",
            working_hours_end || "17:00",
            working_hours_interval || 30,
            working_days || "1,2,3,4,5,6",
            primary_color || "#d97706",
            primary_hover || "#b45309",
            primary_light || "#fffbeb",
            primary_bg_from || "#fef3c7",
            primary_bg_to || "#ffedd5",
            neutral_bg || "#f9fafb",
            text_primary || "#1f2937",
            text_secondary || "#6b7280",
            heading_font || "Inter",
            body_font || "Inter",
            id,
        ]);

        if (result.affectedRows === 0) {
            throw new AppError("Salon nije pronađen", 404);
        }

        res.json({ success: true, message: "Salon uspešno izmenjen" });
    } catch (err) {
        if (err.isOperational) return next(err);
        console.error("Greška pri izmeni salona:", err);
        next(new AppError("Greška pri izmeni salona", 500));
    }
});

/**
 * POST /api/salons/hero-upload - Upload hero slike (admin)
 */
router.post(
    "/hero-upload",
    authenticate,
    upload.single("image"),
    async (req, res, next) => {
        try {
            if (!req.user.isAdmin) {
                throw new AppError("Nemaš dozvolu", 403);
            }

            if (!req.file) {
                throw new AppError("Fajl nije uploadovan", 400);
            }

            const src = `/uploads/${req.file.filename}`;

            // Optimizacija slike sa Sharp-om (ne blokira odgovor)
            if (sharp) {
                try {
                    const filePath = path.join(uploadDir, req.file.filename);
                    const ext = path.extname(req.file.filename).toLowerCase();

                    if (ext !== ".gif") {
                        let sharpInstance = sharp(filePath).resize({
                            width: 1920,
                            withoutEnlargement: true,
                        });

                        if (ext === ".jpg" || ext === ".jpeg") {
                            sharpInstance = sharpInstance.jpeg({
                                quality: 80,
                                mozjpeg: true,
                            });
                        } else if (ext === ".png") {
                            sharpInstance = sharpInstance.png({
                                quality: 80,
                                compressionLevel: 9,
                            });
                        } else if (ext === ".webp") {
                            sharpInstance = sharpInstance.webp({ quality: 80 });
                        }

                        const optimizedPath = filePath.replace(
                            /\.[^.]+$/,
                            "-optimized" + ext,
                        );

                        const info = await sharpInstance.toFile(optimizedPath);
                        try {
                            fs.renameSync(optimizedPath, filePath);
                            console.log(
                                `Hero slika optimizovana: ${req.file.filename} (${info.size} bajtova)`,
                            );
                        } catch (renameErr) {
                            console.error(
                                "Greška pri preimenovanju optimizovane slike:",
                                renameErr,
                            );
                        }
                    }
                } catch (sharpErr) {
                    console.error(
                        "Sharp greška (ne utiče na upload):",
                        sharpErr,
                    );
                }
            }

            const baseUrl = `${req.protocol}://${req.get("host")}`;
            res.json({
                success: true,
                url: `${baseUrl}${src}`,
                message: "Hero slika uspešno uploadovana",
            });
        } catch (err) {
            if (err.isOperational) return next(err);
            next(err);
        }
    },
);

module.exports = router;
