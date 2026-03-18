const ResearchDAO = require("../data/research-dao").ResearchDAO;
const needle = require("needle");
const {
    environmentalScripts
} = require("../../config/config");

// Hardcoded upstream base URL to prevent SSRF via user-controlled URL parameter
const STOCK_API_BASE_URL = "https://finance.yahoo.com/quote/";

/**
 * Escape HTML special characters to prevent XSS when rendering upstream responses.
 */
function escapeHtml(str) {
    if (typeof str !== "string") {
        str = String(str);
    }
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}

/**
 * Validate that the stock symbol contains only alphanumeric characters,
 * dots, and hyphens (typical stock ticker format).
 */
function isValidSymbol(symbol) {
    return /^[A-Za-z0-9.\-]{1,10}$/.test(symbol);
}

function ResearchHandler(db) {
    "use strict";

    const researchDAO = new ResearchDAO(db);

    this.displayResearch = (req, res) => {

        if (req.query.symbol) {
            // Validate the symbol to prevent injection into the URL
            if (!isValidSymbol(req.query.symbol)) {
                res.writeHead(400, { "Content-Type": "text/html" });
                res.write("<h1>Invalid stock symbol. Please use only letters, numbers, dots, and hyphens.</h1>");
                return res.end();
            }

            // Use hardcoded base URL instead of user-controlled req.query.url
            const url = STOCK_API_BASE_URL + encodeURIComponent(req.query.symbol);

            const options = {
                follow_max: 3,        // Limit redirects
                read_timeout: 5000,   // 5 second timeout
                response_timeout: 5000
            };

            return needle.get(url, options, (error, newResponse, body) => {
                if (!error && newResponse.statusCode === 200) {
                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                }
                res.write("<h1>The following is the stock information you requested.</h1>\n\n");
                res.write("\n\n");
                if (body) {
                    // Escape the upstream response body to prevent reflected XSS
                    res.write(escapeHtml(body));
                }
                return res.end();
            });
        }

        return res.render("research", {
            environmentalScripts
        });
    };

}

module.exports = ResearchHandler;
