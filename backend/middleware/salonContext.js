const db = require("../db");
const jwt = require("jsonwebtoken");

// ============================================
// Salon Context Middleware
// Automatski detektuje salon_id na osnovu subdomain-a
// i postavlja req.salonId za sve rute
// Podržava super admin switch context preko JWT-a
// ============================================

/**
 * Proveri JWT token i ako sadrži switchedSalonId,
 * preporuči req.salonId sa tom vrednošću (super admin override).
 */
function applySwitchedContext(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return;

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.switchedSalonId) {
            req.salonId = decoded.switchedSalonId;
            req.isSwitchedContext = true;
            req.switchedSalonName = decoded.switchedSalonName || "";
            console.log(
                `[Switch Context] Super admin prešao na salon ID: ${decoded.switchedSalonId}`,
            );
        }
    } catch (e) {
        // Token nevažeći ili nema switched context — ignoriši
    }
}

function salonContext(req, res, next) {
    // 1. Detektuj subdomain iz Host header-a
    const host = req.get("host") || "";
    const parts = host.split(".");

    let subdomain = "main";
    if (parts.length >= 3 && parts[0] !== "www") {
        subdomain = parts[0];
    }

    req.salonSubdomain = subdomain;

    // 2. Dohvati salon_id iz baze na osnovu subdomain-a
    const sql = "SELECT id, name, is_active FROM salons WHERE subdomain = ?";
    db.query(sql, [subdomain], (err, results) => {
        if (err) {
            console.error("Greška pri dohvatanju salona:", err);
            req.salonId = 1; // fallback na main
            applySwitchedContext(req); // Proveri da li super admin ima switch context
            return next();
        }

        if (results.length === 0) {
            console.warn(
                `Salon sa subdomain-om "${subdomain}" nije pronađen, koristim main`,
            );
            // Fallback na main salon
            db.query(
                "SELECT id, name, is_active FROM salons WHERE subdomain = 'main'",
                (err2, mainResults) => {
                    if (err2 || mainResults.length === 0) {
                        req.salonId = 1;
                    } else {
                        req.salonId = mainResults[0].id;
                    }
                    applySwitchedContext(req); // Proveri da li super admin ima switch context
                    next();
                },
            );
        } else {
            const salon = results[0];
            if (!salon.is_active && subdomain !== "main") {
                return res
                    .status(503)
                    .json({ error: "Salon trenutno nije aktivan" });
            }
            req.salonId = salon.id;
            req.salonName = salon.name;
            applySwitchedContext(req); // Proveri da li super admin ima switch context
            next();
        }
    });
}

module.exports = salonContext;
