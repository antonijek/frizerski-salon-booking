const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticate } = require("../middleware/auth");
const AppError = require("../utils/AppError");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ============================================
// Multer konfiguracija za upload slika frizera
// ============================================

const uploadDir = path.join(__dirname, "..", "uploads");

// Kreiraj uploads folder ako ne postoji
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
        cb(null, `barber-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Samo JPG, PNG, GIF i WebP slike su dozvoljene"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// Helper: async query wrapper
const query = (sql, params) =>
    new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

// ============================================
// Barbers API rute
// ============================================

/**
 * GET /api/barbers - Dohvati sve aktivne frizere (sa radnim vremenom)
 * Salon_id se automatski postavlja iz subdomain-a
 */
router.get("/", async (req, res, next) => {
    try {
        const salonId = req.salonId;
        const sql =
            "SELECT id, name, image_url, title, bio, is_active, work_days, TIME_FORMAT(work_start, '%H:%i') as work_start, TIME_FORMAT(work_end, '%H:%i') as work_end FROM barbers WHERE is_active = TRUE AND salon_id = ? ORDER BY name";
        const results = await query(sql, [salonId]);
        res.json(results);
    } catch (err) {
        console.error("Greška pri dohvatanju frizera:", err);
        return next(new AppError("Greška pri dohvatanju frizera", 500));
    }
});

/**
 * GET /api/barbers/all - Dohvati sve frizere (admin)
 * Salon_id se automatski postavlja iz subdomain-a
 */
router.get("/all", authenticate, async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(new AppError("Nemaš dozvolu", 403));
        }

        const salonId = req.salonId;
        const sql =
            "SELECT id, name, image_url, title, bio, is_active, work_days, TIME_FORMAT(work_start, '%H:%i') as work_start, TIME_FORMAT(work_end, '%H:%i') as work_end FROM barbers WHERE salon_id = ? ORDER BY name";
        const results = await query(sql, [salonId]);
        res.json(results);
    } catch (err) {
        console.error("Greška pri dohvatanju frizera:", err);
        return next(new AppError("Greška pri dohvatanju frizera", 500));
    }
});

/**
 * POST /api/barbers/upload-image - Upload slike frizera (admin)
 */
router.post(
    "/upload-image",
    authenticate,
    upload.single("image"),
    (req, res, next) => {
        if (!req.user.isAdmin) {
            return next(new AppError("Nemaš dozvolu", 403));
        }

        if (!req.file) {
            return next(new AppError("Niste odabrali sliku", 400));
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ success: true, image_url: imageUrl });
    },
);

/**
 * POST /api/barbers - Kreiraj novog frizera (admin)
 */
router.post("/", authenticate, async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(new AppError("Nemaš dozvolu", 403));
        }

        const { name, image_url, title, bio, work_days, work_start, work_end } =
            req.body;

        if (!name || !name.trim()) {
            return next(new AppError("Ime frizera je obavezno", 400));
        }

        const salonId = req.salonId;
        const sql =
            "INSERT INTO barbers (name, image_url, title, bio, work_days, work_start, work_end, salon_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const result = await query(sql, [
            name.trim(),
            image_url || null,
            title || null,
            bio || null,
            work_days || "1,2,3,4,5,6",
            work_start || "09:00",
            work_end || "17:00",
            salonId,
        ]);
        res.status(201).json({
            success: true,
            message: "Frizer uspešno kreiran",
            id: result.insertId,
        });
    } catch (err) {
        console.error("Greška pri kreiranju frizera:", err);
        return next(new AppError("Greška pri kreiranju frizera", 500));
    }
});

/**
 * PUT /api/barbers/:id - Izmeni frizera (admin)
 */
router.put("/:id", authenticate, async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(new AppError("Nemaš dozvolu", 403));
        }

        const { id } = req.params;
        const {
            name,
            image_url,
            title,
            bio,
            is_active,
            work_days,
            work_start,
            work_end,
        } = req.body;

        if (!name || !name.trim()) {
            return next(new AppError("Ime frizera je obavezno", 400));
        }

        const salonId = req.salonId;
        const sql =
            "UPDATE barbers SET name = ?, image_url = ?, title = ?, bio = ?, is_active = ?, work_days = ?, work_start = ?, work_end = ? WHERE id = ? AND salon_id = ?";
        const result = await query(sql, [
            name.trim(),
            image_url || null,
            title || null,
            bio || null,
            is_active !== undefined ? is_active : true,
            work_days || "1,2,3,4,5,6",
            work_start || "09:00",
            work_end || "17:00",
            id,
            salonId,
        ]);

        if (result.affectedRows === 0) {
            return next(new AppError("Frizer nije pronađen", 404));
        }
        res.json({ success: true, message: "Frizer uspešno izmenjen" });
    } catch (err) {
        console.error("Greška pri izmeni frizera:", err);
        return next(new AppError("Greška pri izmeni frizera", 500));
    }
});

/**
 * DELETE /api/barbers/:id - Obriši frizera (admin)
 */
router.delete("/:id", authenticate, async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(new AppError("Nemaš dozvolu", 403));
        }

        const { id } = req.params;
        const salonId = req.salonId;

        const sql = "DELETE FROM barbers WHERE id = ? AND salon_id = ?";
        const result = await query(sql, [id, salonId]);

        if (result.affectedRows === 0) {
            return next(new AppError("Frizer nije pronađen", 404));
        }
        res.json({ success: true, message: "Frizer uspešno obrisan" });
    } catch (err) {
        console.error("Greška pri brisanju frizera:", err);
        return next(new AppError("Greška pri brisanju frizera", 500));
    }
});

module.exports = router;
