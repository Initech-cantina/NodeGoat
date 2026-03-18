// Error handling middleware

const errorHandler = (err, req, res, next) => {

    "use strict";

    console.error(err.message);
    console.error(err.stack);

    // Set security headers that finalhandler would normally provide
    res.setHeader("Content-Security-Policy", "default-src 'self'");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");

    // Respect the error's status code (e.g., 400 for malformed JSON) instead of
    // unconditionally returning 500
    const statusCode = err.status || 500;
    res.status(statusCode);

    // Avoid leaking raw error details to the client in production
    const safeMessage = statusCode >= 500
        ? "An internal server error occurred."
        : err.message || "An error occurred.";

    res.render("error-template", {
        error: safeMessage
    });
};

module.exports = { errorHandler };
