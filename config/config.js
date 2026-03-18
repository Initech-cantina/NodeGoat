const _ = require("underscore");
const path = require("path");
const util = require("util");

const finalEnv = process.env.NODE_ENV || "development";

const allConf = require(path.resolve(__dirname + "/../config/env/all.js"));
const envConf = require(path.resolve(__dirname + "/../config/env/" + finalEnv.toLowerCase() + ".js")) || {};

const config = { ...allConf, ...envConf };

// Redact secret-like fields before logging
const safeConfig = { ...config };
const sensitiveKeys = ["zapApiKey", "dbPassword", "secret", "apiKey"];
for (const key of Object.keys(safeConfig)) {
   if (sensitiveKeys.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
      safeConfig[key] = safeConfig[key] ? "[REDACTED]" : "";
   }
}
console.log(`Current Config:`);
console.log(util.inspect(safeConfig, false, null));

module.exports = config;
