// Error handling middleware

const errorHandler = (err, req, res, next) => {

    "use strict";

    console.error(err.message);
    console.error(err.stack);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode);
    res.render("error-template", {
        error: err
    });
};

module.exports = { errorHandler };
