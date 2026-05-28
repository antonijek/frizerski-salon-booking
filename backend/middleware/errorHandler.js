const AppError = require("../utils/AppError");

/**
 * Global error handler middleware.
 * Catches all errors thrown via next(error) or AppError instances
 * and returns a consistent JSON response format.
 */
function errorHandler(err, req, res, next) {
    // Log the error for debugging
    if (err instanceof AppError && err.statusCode < 500) {
        // Known/expected errors — log as warning
        console.warn(`[${err.statusCode}] ${err.message}`);
    } else {
        // 500 or unknown errors — log as error
        console.error("❌ Neobrađena greška:", err);
    }

    // Determine status code
    const statusCode = err.statusCode || 500;

    // Build response
    const response = {
        success: false,
        error: err.message || "Greška na serveru",
    };

    // Include optional details
    if (err.details) {
        response.details = err.details;
    }

    // In development, include stack trace
    if (process.env.NODE_ENV !== "production" && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
}

module.exports = errorHandler;
