// Error handling middleware

const errorHandler = (err, req, res, next) => {

    "use strict";

    console.error(err.message);
    console.error(err.stack);

    // Set security headers that finalhandler would normally provide
    res.setHeader("Content-Security-Policy", "default-src 'self'");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Cache-Control", "no-store");

    // Respect the error's status code (e.g., 400 for malformed JSON) instead of always returning 500
    const statusCode = err.status || 500;
    res.status(statusCode);

    // Sanitize the error message to prevent reflected content in error rendering
    const safeError = {
        message: typeof err.message === "string" ? err.message : "An unexpected error occurred",
        status: statusCode
    };

    res.render("error-template", {
        error: safeError.message
    });
};

module.exports = { errorHandler };
