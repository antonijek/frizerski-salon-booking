/**
 * Custom error class for API errors.
 * Allows throwing errors with HTTP status codes that
 * the global error handler will catch and format.
 */
class AppError extends Error {
    /**
     * @param {string} message - Human-readable error message (in Serbian)
     * @param {number} statusCode - HTTP status code (default 500)
     * @param {object} [details] - Optional additional error details
     */
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true; // Marks known/expected errors
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
