const ResearchDAO = require("../data/research-dao").ResearchDAO;
const needle = require("needle");
const {
    environmentalScripts
} = require("../../config/config");

// Hardcoded allowlist of upstream base URLs to prevent SSRF
const ALLOWED_BASE_URLS = [
    "https://finance.yahoo.com/quote/"
];

// HTML-escape utility to prevent reflected XSS
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

function ResearchHandler(db) {
    "use strict";

    const researchDAO = new ResearchDAO(db);

    this.displayResearch = (req, res) => {

        if (req.query.symbol) {
            // Use hardcoded base URL instead of user-controlled req.query.url
            const baseUrl = ALLOWED_BASE_URLS[0];
            // Sanitize symbol to alphanumeric, dot, dash, and caret only
            const symbol = req.query.symbol.replace(/[^a-zA-Z0-9.\-^]/g, "");
            if (!symbol) {
                return res.status(400).send("Invalid stock symbol.");
            }
            const url = baseUrl + encodeURIComponent(symbol);

            const requestOptions = {
                follow_max: 3,         // Limit redirects
                read_timeout: 5000,    // 5 second timeout
                response_timeout: 5000
            };

            return needle.get(url, requestOptions, (error, newResponse, body) => {
                if (error || !newResponse || newResponse.statusCode !== 200) {
                    res.writeHead(500, { "Content-Type": "text/html" });
                    res.write("<h1>Error retrieving stock information. Please try again.</h1>");
                    return res.end();
                }

                res.writeHead(200, {
                    "Content-Type": "text/html"
                });
                res.write("<h1>The following is the stock information you requested.</h1>\n\n");
                res.write("\n\n");
                if (body) {
                    // Escape upstream response to prevent reflected XSS
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
