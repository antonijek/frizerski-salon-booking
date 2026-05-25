const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authenticate } = require("../middleware/auth");

// ============================================
// Multer konfiguracija za upload slika
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
        // Generiši jedinstveno ime: timestamp-originalni_naziv
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `gallery-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    // Dozvoli samo slike
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
// Gallery API rute
// ============================================

/**
 * GET /api/gallery - Dohvati sve slike iz galerije
 */
router.get("/", (req, res) => {
    const sql =
        "SELECT id, src, alt, sort_order FROM gallery_images ORDER BY sort_order ASC, created_at DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju galerije:", err);
            return res
                .status(500)
                .json({ error: "Greška pri dohvatanju galerije" });
        }
        // Dodaj pun URL za slike koje su uploadovane
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const images = results.map((img) => ({
            ...img,
            src: img.src.startsWith("http") ? img.src : `${baseUrl}${img.src}`,
        }));
        res.json(images);
    });
});

/**
 * POST /api/gallery/upload - Dodaj novu sliku uploadom fajla (admin)
 */
router.post("/upload", authenticate, upload.single("image"), (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Nemaš dozvolu" });
    }

    if (!req.file) {
        return res.status(400).json({ error: "Fajl nije uploadovan" });
    }

    const src = `/uploads/${req.file.filename}`;
    const alt = req.body.alt || req.file.originalname.replace(/\.[^/.]+$/, "");

    if (!alt || !alt.trim()) {
        return res.status(400).json({ error: "Naziv slike je obavezan" });
    }

    // Dohvati max sort_order da dodamo na kraj
    db.query(
        "SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM gallery_images",
        (err, rows) => {
            if (err) {
                console.error("Greška pri dohvatanju redosleda:", err);
                return res
                    .status(500)
                    .json({ error: "Greška pri dodavanju slike" });
            }

            const nextOrder = rows[0].next_order;
            const sql =
                "INSERT INTO gallery_images (src, alt, sort_order) VALUES (?, ?, ?)";
            db.query(
                sql,
                [src.trim(), alt.trim(), nextOrder],
                (err, result) => {
                    if (err) {
                        console.error("Greška pri dodavanju slike:", err);
                        return res
                            .status(500)
                            .json({ error: "Greška pri dodavanju slike" });
                    }
                    res.status(201).json({
                        success: true,
                        message: "Slika uspešno dodata",
                        id: result.insertId,
                    });
                },
            );
        },
    );
});

/**
 * POST /api/gallery/url - Dodaj novu sliku putem URL-a (admin)
 */
router.post("/url", authenticate, (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Nemaš dozvolu" });
    }

    const { src, alt } = req.body;

    if (!src || !src.trim()) {
        return res.status(400).json({ error: "URL slike je obavezan" });
    }
    if (!alt || !alt.trim()) {
        return res.status(400).json({ error: "Naziv slike je obavezan" });
    }

    // Dohvati max sort_order da dodamo na kraj
    db.query(
        "SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM gallery_images",
        (err, rows) => {
            if (err) {
                console.error("Greška pri dohvatanju redosleda:", err);
                return res
                    .status(500)
                    .json({ error: "Greška pri dodavanju slike" });
            }

            const nextOrder = rows[0].next_order;
            const sql =
                "INSERT INTO gallery_images (src, alt, sort_order) VALUES (?, ?, ?)";
            db.query(
                sql,
                [src.trim(), alt.trim(), nextOrder],
                (err, result) => {
                    if (err) {
                        console.error("Greška pri dodavanju slike:", err);
                        return res
                            .status(500)
                            .json({ error: "Greška pri dodavanju slike" });
                    }
                    res.status(201).json({
                        success: true,
                        message: "Slika uspešno dodata",
                        id: result.insertId,
                    });
                },
            );
        },
    );
});

/**
 * DELETE /api/gallery/:id - Obriši sliku (admin)
 */
router.delete("/:id", authenticate, (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Nemaš dozvolu" });
    }

    const { id } = req.params;

    // Prvo dohvati src da obrišemo fajl ako je uploadovan
    db.query(
        "SELECT src FROM gallery_images WHERE id = ?",
        [id],
        (err, rows) => {
            if (err) {
                console.error("Greška pri dohvatanju slike:", err);
                return res
                    .status(500)
                    .json({ error: "Greška pri brisanju slike" });
            }
            if (rows.length === 0) {
                return res.status(404).json({ error: "Slika nije pronađena" });
            }

            const src = rows[0].src;

            // Obriši iz baze
            db.query(
                "DELETE FROM gallery_images WHERE id = ?",
                [id],
                (err, result) => {
                    if (err) {
                        console.error("Greška pri brisanju slike:", err);
                        return res
                            .status(500)
                            .json({ error: "Greška pri brisanju slike" });
                    }

                    // Ako je uploadovan fajl, obriši ga sa diska
                    if (src && src.startsWith("/uploads/")) {
                        const filePath = path.join(
                            __dirname,
                            "..",
                            src.replace(/^\//, ""),
                        );
                        fs.unlink(filePath, (err) => {
                            if (err && err.code !== "ENOENT") {
                                console.error(
                                    "Greška pri brisanju fajla:",
                                    err,
                                );
                            }
                        });
                    }

                    res.json({
                        success: true,
                        message: "Slika uspešno obrisana",
                    });
                },
            );
        },
    );
});

module.exports = router;
