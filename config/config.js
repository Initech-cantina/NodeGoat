const _ = require("underscore");
const path = require("path");
const util = require("util");

const finalEnv = process.env.NODE_ENV || "development";

const allConf = require(path.resolve(__dirname + "/../config/env/all.js"));
const envConf = require(path.resolve(__dirname + "/../config/env/" + finalEnv.toLowerCase() + ".js")) || {};

const config = { ...allConf, ...envConf };

// Redact sensitive values before logging configuration
const SENSITIVE_KEYS = ["db", "cookieSecret", "cryptoKey", "zapApiKey"];

const redactedConfig = Object.keys(config).reduce((acc, key) => {
    if (SENSITIVE_KEYS.includes(key) && config[key]) {
        acc[key] = "[REDACTED]";
    } else {
        acc[key] = config[key];
    }
    return acc;
}, {});

console.log(`Current Config:`);
console.log(util.inspect(redactedConfig, false, null));

module.exports = config;
