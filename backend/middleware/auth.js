const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

// ============================================
// Auth middleware
// ============================================

/**
 * Proveri JWT token
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Niste prijavljeni", 401));
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return next(new AppError("Nevažeći token", 401));
    }
}

/**
 * Proveri da li je korisnik admin
 */
function isAdmin(req, res, next) {
    if (!req.user || !req.user.isAdmin) {
        return next(new AppError("Nemate administratorska prava", 403));
    }
    next();
}

/**
 * Proveri da li je korisnik super admin
 */
function isSuperAdmin(req, res, next) {
    if (!req.user || !req.user.isSuperAdmin) {
        return next(
            new AppError("Samo super admin ima pristup ovoj funkciji", 403),
        );
    }
    next();
}

module.exports = { authenticate, isAdmin, isSuperAdmin };
