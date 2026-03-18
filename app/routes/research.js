const ResearchDAO = require("../data/research-dao").ResearchDAO;
const needle = require("needle");
const url = require("url");
const {
    environmentalScripts
} = require("../../config/config");

// Server-side allowlist of permitted upstream stock data providers.
// Only HTTPS requests to these hosts are allowed.
const ALLOWED_HOSTS = [
    "finance.yahoo.com",
    "www.yahoo.com",
    "query1.finance.yahoo.com",
    "query2.finance.yahoo.com"
];

const STOCK_BASE_URL = "https://finance.yahoo.com/quote/";

function ResearchHandler(db) {
    "use strict";

    const researchDAO = new ResearchDAO(db);

    this.displayResearch = (req, res) => {

        if (req.query.symbol) {
            // Sanitize symbol: allow only alphanumeric characters, dots, and hyphens
            const symbol = req.query.symbol.replace(/[^a-zA-Z0-9.\-]/g, "");

            if (!symbol) {
                res.writeHead(400, { "Content-Type": "text/html" });
                res.write("<h1>Invalid stock symbol.</h1>");
                return res.end();
            }

            // Use server-controlled base URL instead of user-supplied url parameter
            const requestUrl = STOCK_BASE_URL + encodeURIComponent(symbol);

            // Validate the constructed URL as an additional safety measure
            let parsedUrl;
            try {
                parsedUrl = new URL(requestUrl);
            } catch (e) {
                res.writeHead(400, { "Content-Type": "text/html" });
                res.write("<h1>Invalid request.</h1>");
                return res.end();
            }

            // Enforce HTTPS scheme
            if (parsedUrl.protocol !== "https:") {
                res.writeHead(400, { "Content-Type": "text/html" });
                res.write("<h1>Only HTTPS requests are allowed.</h1>");
                return res.end();
            }

            // Enforce hostname allowlist
            if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
                res.writeHead(400, { "Content-Type": "text/html" });
                res.write("<h1>Requested host is not allowed.</h1>");
                return res.end();
            }

            return needle.get(requestUrl, { follow_max: 0 }, (error, newResponse, body) => {
                if (!error && newResponse.statusCode === 200) {
                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                }
                res.write("<h1>The following is the stock information you requested.</h1>\n\n");
                res.write("\n\n");
                if (body) {
                    res.write(body);
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
