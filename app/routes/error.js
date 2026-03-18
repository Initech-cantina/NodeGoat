// Error handling middleware

const errorHandler = (err, req, res, next) => {

    "use strict";

    console.error(err.message || err);
    console.error(err.stack);
    res.status(500);
    // Fix: render a generic error message instead of raw error values
    res.render("error-template", {
        error: "An unexpected error has occurred. Please try again later."
    });
};

module.exports = { errorHandler };
