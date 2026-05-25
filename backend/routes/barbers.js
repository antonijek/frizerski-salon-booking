const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticate } = require("../middleware/auth");
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

// ============================================
// Barbers API rute
// ============================================

/**
 * GET /api/barbers - Dohvati sve aktivne frizere (sa radnim vremenom)
 */
router.get("/", (req, res) => {
    const sql =
        "SELECT id, name, image_url, title, bio, is_active, work_days, TIME_FORMAT(work_start, '%H:%i') as work_start, TIME_FORMAT(work_end, '%H:%i') as work_end FROM barbers WHERE is_active = TRUE ORDER BY name";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju frizera:", err);
            return res
                .status(500)
                .json({ error: "Greška pri dohvatanju frizera" });
        }
        res.json(results);
    });
});

/**
 * GET /api/barbers/all - Dohvati sve frizere (admin)
 */
router.get("/all", authenticate, (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Nemaš dozvolu" });
    }

    const sql =
        "SELECT id, name, image_url, title, bio, is_active, work_days, TIME_FORMAT(work_start, '%H:%i') as work_start, TIME_FORMAT(work_end, '%H:%i') as work_end FROM barbers ORDER BY name";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju frizera:", err);
            return res
                .status(500)
                .json({ error: "Greška pri dohvatanju frizera" });
        }
        res.json(results);
    });
});

/**
 * POST /api/barbers/upload-image - Upload slike frizera (admin)
 */
router.post(
    "/upload-image",
    authenticate,
    upload.single("image"),
    (req, res) => {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: "Nemaš dozvolu" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Niste odabrali sliku" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ success: true, image_url: imageUrl });
    },
);

/**
 * POST /api/barbers - Kreiraj novog frizera (admin)
 */
router.post("/", authenticate, (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Nemaš dozvolu" });
    }

    const { name, image_url, title, bio, work_days, work_start, work_end } =
        req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: "Ime frizera je obavezno" });
    }

    const sql =
        "INSERT INTO barbers (name, image_url, title, bio, work_days, work_start, work_end) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(
        sql,
        [
            name.trim(),
            image_url || null,
            title || null,
            bio || null,
            work_days || "1,2,3,4,5,6",
            work_start || "09:00",
            work_end || "17:00",
        ],
        (err, result) => {
            if (err) {
                console.error("Greška pri kreiranju frizera:", err);
                return res
                    .status(500)
                    .json({ error: "Greška pri kreiranju frizera" });
            }
            res.status(201).json({
                success: true,
                message: "Frizer uspešno kreiran",
                id: result.insertId,
            });
        },
    );
});

/**
 * PUT /api/barbers/:id - Izmeni frizera (admin)
 */
router.put("/:id", authenticate, (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Nemaš dozvolu" });
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
        return res.status(400).json({ error: "Ime frizera je obavezno" });
    }

    const sql =
        "UPDATE barbers SET name = ?, image_url = ?, title = ?, bio = ?, is_active = ?, work_days = ?, work_start = ?, work_end = ? WHERE id = ?";
    db.query(
        sql,
        [
            name.trim(),
            image_url || null,
            title || null,
            bio || null,
            is_active !== undefined ? is_active : true,
            work_days || "1,2,3,4,5,6",
            work_start || "09:00",
            work_end || "17:00",
            id,
        ],
        (err, result) => {
            if (err) {
                console.error("Greška pri izmeni frizera:", err);
                return res
                    .status(500)
                    .json({ error: "Greška pri izmeni frizera" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Frizer nije pronađen" });
            }
            res.json({ success: true, message: "Frizer uspešno izmenjen" });
        },
    );
});

/**
 * DELETE /api/barbers/:id - Obriši frizera (admin)
 */
router.delete("/:id", authenticate, (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Nemaš dozvolu" });
    }

    const { id } = req.params;

    const sql = "DELETE FROM barbers WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Greška pri brisanju frizera:", err);
            return res
                .status(500)
                .json({ error: "Greška pri brisanju frizera" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Frizer nije pronađen" });
        }
        res.json({ success: true, message: "Frizer uspešno obrisan" });
    });
});

module.exports = router;
