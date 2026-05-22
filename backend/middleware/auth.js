const jwt = require("jsonwebtoken");

// ============================================
// Auth middleware
// ============================================

/**
 * Proveri JWT token
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Niste prijavljeni" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Nevažeći token" });
    }
}

/**
 * Proveri da li je korisnik admin
 */
function isAdmin(req, res, next) {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: "Nemate administratorska prava" });
    }
    next();
}

module.exports = { authenticate, isAdmin };
