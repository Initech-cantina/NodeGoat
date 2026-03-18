// Error handling middleware

const errorHandler = (err, req, res,next) => {

    "use strict";

    console.error(err.message);
    console.error(err.stack);
    res.status(err.status || err.statusCode || 500);
    res.render("error-template", {
        error: err
    });
};

module.exports = { errorHandler };
