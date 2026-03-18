const ResearchDAO = require("../data/research-dao").ResearchDAO;
const needle = require("needle");
const {
    environmentalScripts
} = require("../../config/config");

/**
 * Escape HTML special characters to prevent XSS when reflecting upstream content.
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

// Allowlisted base URL for stock research — never accept a URL from the client.
const ALLOWED_BASE_URL = "https://finance.yahoo.com/quote/";

function ResearchHandler(db) {
    "use strict";

    const researchDAO = new ResearchDAO(db);

    this.displayResearch = (req, res) => {

        if (req.query.symbol) {
            // Validate that symbol contains only expected characters (alphanumeric, dot, hyphen)
            const symbol = req.query.symbol;
            if (!/^[a-zA-Z0-9.\-]{1,10}$/.test(symbol)) {
                res.writeHead(400, { "Content-Type": "text/html" });
                res.write("<h1>Invalid stock symbol.</h1>");
                return res.end();
            }

            // Build URL server-side from allowlisted base — ignore any client-supplied url parameter
            const url = ALLOWED_BASE_URL + encodeURIComponent(symbol);
            return needle.get(url, (error, newResponse, body) => {
                if (!error && newResponse.statusCode === 200) {
                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                }
                res.write("<h1>The following is the stock information you requested.</h1>\n\n");
                res.write("\n\n");
                if (body) {
                    // HTML-escape the upstream response to prevent injection of scripts
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
