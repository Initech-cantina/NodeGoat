const ResearchDAO = require("../data/research-dao").ResearchDAO;
const needle = require("needle");
const {
    environmentalScripts
} = require("../../config/config");

// Allowlist of permitted upstream hosts for stock research
const ALLOWED_URL_PREFIXES = [
    "https://finance.yahoo.com/"
];

function isAllowedUrl(url) {
    return ALLOWED_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

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
            // Hardcode the allowed base URL instead of accepting it from the client
            const baseUrl = "https://finance.yahoo.com/quote/";
            const symbol = req.query.symbol;

            // Validate the symbol contains only expected characters (alphanumeric, dots, dashes)
            if (!/^[a-zA-Z0-9.\-]+$/.test(symbol)) {
                res.writeHead(400, { "Content-Type": "text/html" });
                res.write("<h1>Invalid stock symbol.</h1>");
                return res.end();
            }

            const url = baseUrl + encodeURIComponent(symbol);

            return needle.get(url, (error, newResponse, body) => {
                if (!error && newResponse.statusCode === 200) {
                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                }
                res.write("<h1>The following is the stock information you requested.</h1>\n\n");
                res.write("\n\n");
                if (body) {
                    // Escape the upstream response to prevent XSS
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
