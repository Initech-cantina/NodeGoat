// Error handling middleware

const errorHandler = (err, req, res, next) => {

    "use strict";

    console.error(err.message);
    console.error(err.stack);
    res.status(500);
    res.render("error-template", {
        error: "An internal server error has occurred."
    });
};

module.exports = { errorHandler };
