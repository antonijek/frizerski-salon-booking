const express = require("express");
const router = express.Router();
const AppError = require("../utils/AppError");
const { authenticate, isAdmin } = require("../middleware/auth");
const appointmentService = require("../services/appointmentService");
const statsService = require("../services/statsService");

// ============================================
// Statistika (samo admin)
// ============================================

router.get("/stats", authenticate, isAdmin, async (req, res, next) => {
    try {
        const { period = "all", start_date, end_date } = req.query;
        const stats = await statsService.getStats(
            req.salonId,
            period,
            start_date,
            end_date,
        );
        res.json(stats);
    } catch (err) {
        console.error("Greška pri dohvatanju statistike:", err);
        next(new AppError("Greška na serveru", 500));
    }
});

// ============================================
// Dohvati sve termine
// ============================================

router.get("/", async (req, res, next) => {
    try {
        const results = await appointmentService.getAll(req.salonId);
        res.json(results);
    } catch (err) {
        console.error("Greška pri dohvatanju termina:", err);
        next(new AppError("Greška na serveru", 500));
    }
});

// ============================================
// Dohvati termine za određeni datum
// ============================================

router.get("/date/:date", async (req, res, next) => {
    try {
        const { date } = req.params;
        const results = await appointmentService.getByDate(req.salonId, date);
        res.json(results);
    } catch (err) {
        console.error("Greška pri dohvatanju termina:", err);
        next(new AppError("Greška na serveru", 500));
    }
});

// ============================================
// Dohvati termine za određeni datum i frizera
// ============================================

router.get("/date/:date/barber/:barberId", async (req, res, next) => {
    try {
        const { date, barberId } = req.params;
        const results = await appointmentService.getByDateAndBarber(
            req.salonId,
            date,
            barberId,
        );
        res.json(results);
    } catch (err) {
        console.error("Greška pri dohvatanju termina:", err);
        next(new AppError("Greška na serveru", 500));
    }
});

// ============================================
// Dohvati termine po broju telefona
// ============================================

router.get("/phone/:phone", async (req, res, next) => {
    try {
        const { phone } = req.params;
        const results = await appointmentService.getByPhone(req.salonId, phone);
        res.json(results);
    } catch (err) {
        console.error("Greška pri dohvatanju termina:", err);
        next(new AppError("Greška na serveru", 500));
    }
});

// ============================================
// Kreiraj novi termin
// ============================================

router.post("/", async (req, res, next) => {
    try {
        const result = await appointmentService.create(req.salonId, req.body);
        res.status(201).json(result);
    } catch (err) {
        if (err.isOperational) return next(err);
        console.error("Greška pri kreiranju termina:", err);
        next(new AppError("Greška na serveru", 500));
    }
});

// ============================================
// Izmeni termin
// ============================================

router.put("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await appointmentService.update(
            req.salonId,
            id,
            req.body,
        );
        res.json(result);
    } catch (err) {
        if (err.isOperational) return next(err);
        console.error("Greška pri izmeni termina:", err);
        next(new AppError("Greška na serveru", 500));
    }
});

// ============================================
// Obriši termin
// ============================================

router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await appointmentService.remove(req.salonId, id);
        res.json(result);
    } catch (err) {
        if (err.isOperational) return next(err);
        console.error("Greška pri brisanju termina:", err);
        next(new AppError("Greška na serveru", 500));
    }
});

module.exports = router;
