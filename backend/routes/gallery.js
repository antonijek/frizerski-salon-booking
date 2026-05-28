const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
let sharp = null;
try {
    sharp = require("sharp");
} catch (e) {
    console.log("Sharp nije dostupan - optimizacija slika preskočena");
}
const { authenticate } = require("../middleware/auth");
const AppError = require("../utils/AppError");

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

// Helper: async query wrapper
const query = (sql, params) =>
    new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

// ============================================
// Sharp optimizacija slike (fire-and-forget)
// ============================================
function optimizeImage(filename) {
    if (!sharp) return;

    try {
        const filePath = path.join(uploadDir, filename);
        const ext = path.extname(filename).toLowerCase();

        if (ext === ".gif") return;

        let sharpInstance = sharp(filePath).resize({
            width: 1200,
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

        const optimizedPath = filePath.replace(/\.[^.]+$/, "-optimized" + ext);

        sharpInstance
            .toFile(optimizedPath)
            .then((info) => {
                try {
                    fs.renameSync(optimizedPath, filePath);
                    console.log(
                        `Slika optimizovana: ${filename} (${info.size} bajtova)`,
                    );
                } catch (renameErr) {
                    console.error(
                        "Greška pri preimenovanju optimizovane slike:",
                        renameErr,
                    );
                }
            })
            .catch((err) => {
                console.error("Greška pri optimizaciji slike:", err);
                try {
                    if (fs.existsSync(optimizedPath))
                        fs.unlinkSync(optimizedPath);
                } catch (e) {}
            });
    } catch (sharpErr) {
        console.error("Sharp greška (ne utiče na upload):", sharpErr);
    }
}

// ============================================
// Gallery API rute
// ============================================

/**
 * GET /api/gallery - Dohvati sve slike iz galerije
 * Salon_id se automatski postavlja iz subdomain-a
 */
router.get("/", async (req, res, next) => {
    try {
        const salonId = req.salonId;
        const sql =
            "SELECT id, src, alt, sort_order FROM gallery_images WHERE salon_id = ? ORDER BY sort_order ASC, created_at DESC";
        const results = await query(sql, [salonId]);
        // Dodaj pun URL za slike koje su uploadovane
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const images = results.map((img) => ({
            ...img,
            src: img.src.startsWith("http") ? img.src : `${baseUrl}${img.src}`,
        }));
        res.json(images);
    } catch (err) {
        console.error("Greška pri dohvatanju galerije:", err);
        return next(new AppError("Greška pri dohvatanju galerije", 500));
    }
});

/**
 * POST /api/gallery/upload - Dodaj novu sliku uploadom fajla (admin)
 */
router.post(
    "/upload",
    authenticate,
    upload.single("image"),
    async (req, res, next) => {
        try {
            if (!req.user.isAdmin) {
                return next(new AppError("Nemaš dozvolu", 403));
            }

            if (!req.file) {
                return next(new AppError("Fajl nije uploadovan", 400));
            }

            const src = `/uploads/${req.file.filename}`;
            const alt =
                req.body.alt || req.file.originalname.replace(/\.[^/.]+$/, "");

            if (!alt || !alt.trim()) {
                return next(new AppError("Naziv slike je obavezan", 400));
            }

            // Fire-and-forget Sharp optimizacija
            optimizeImage(req.file.filename);

            const salonId = req.salonId;
            // Dohvati max sort_order da dodamo na kraj
            const rows = await query(
                "SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM gallery_images WHERE salon_id = ?",
                [salonId],
            );

            const nextOrder = rows[0].next_order;
            const result = await query(
                "INSERT INTO gallery_images (src, alt, sort_order, salon_id) VALUES (?, ?, ?, ?)",
                [src.trim(), alt.trim(), nextOrder, salonId],
            );

            res.status(201).json({
                success: true,
                message: "Slika uspešno dodata",
                id: result.insertId,
            });
        } catch (err) {
            console.error("Greška pri dodavanju slike:", err);
            return next(new AppError("Greška pri dodavanju slike", 500));
        }
    },
);

/**
 * POST /api/gallery/url - Dodaj novu sliku putem URL-a (admin)
 */
router.post("/url", authenticate, async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(new AppError("Nemaš dozvolu", 403));
        }

        const { src, alt } = req.body;

        if (!src || !src.trim()) {
            return next(new AppError("URL slike je obavezan", 400));
        }
        if (!alt || !alt.trim()) {
            return next(new AppError("Naziv slike je obavezan", 400));
        }

        const salonId = req.salonId;
        // Dohvati max sort_order da dodamo na kraj
        const rows = await query(
            "SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM gallery_images WHERE salon_id = ?",
            [salonId],
        );

        const nextOrder = rows[0].next_order;
        const result = await query(
            "INSERT INTO gallery_images (src, alt, sort_order, salon_id) VALUES (?, ?, ?, ?)",
            [src.trim(), alt.trim(), nextOrder, salonId],
        );

        res.status(201).json({
            success: true,
            message: "Slika uspešno dodata",
            id: result.insertId,
        });
    } catch (err) {
        console.error("Greška pri dodavanju slike:", err);
        return next(new AppError("Greška pri dodavanju slike", 500));
    }
});

/**
 * DELETE /api/gallery/:id - Obriši sliku (admin)
 */
router.delete("/:id", authenticate, async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(new AppError("Nemaš dozvolu", 403));
        }

        const { id } = req.params;
        const salonId = req.salonId;

        // Prvo dohvati src da obrišemo fajl ako je uploadovan
        const rows = await query(
            "SELECT src FROM gallery_images WHERE id = ? AND salon_id = ?",
            [id, salonId],
        );

        if (rows.length === 0) {
            return next(new AppError("Slika nije pronađena", 404));
        }

        const imgSrc = rows[0].src;

        // Obriši iz baze
        await query(
            "DELETE FROM gallery_images WHERE id = ? AND salon_id = ?",
            [id, salonId],
        );

        // Ako je uploadovan fajl, obriši ga sa diska
        if (imgSrc && imgSrc.startsWith("/uploads/")) {
            const filePath = path.join(
                __dirname,
                "..",
                imgSrc.replace(/^\//, ""),
            );
            fs.unlink(filePath, (err) => {
                if (err && err.code !== "ENOENT") {
                    console.error("Greška pri brisanju fajla:", err);
                }
            });
        }

        res.json({
            success: true,
            message: "Slika uspešno obrisana",
        });
    } catch (err) {
        console.error("Greška pri brisanju slike:", err);
        return next(new AppError("Greška pri brisanju slike", 500));
    }
});

module.exports = router;
