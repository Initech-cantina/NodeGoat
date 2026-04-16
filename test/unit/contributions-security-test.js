/* globals describe, it */
"use strict";

var assert = require("assert");

describe("contributions handler - input parsing security", function() {

    describe("parseInt replaces eval for contribution fields", function() {

        it("should parse valid numeric strings correctly", function() {
            assert.strictEqual(parseInt("10", 10), 10);
            assert.strictEqual(parseInt("0", 10), 0);
            assert.strictEqual(parseInt("25", 10), 25);
        });

        it("should return NaN for non-numeric injection payloads", function() {
            var nanInputs = [
                "process.exit(1)",
                "require('child_process').exec('whoami')",
                "throw '<img src=x onerror=alert(1)>'",
                "(function(){ return 42; })()"
            ];
            nanInputs.forEach(function(input) {
                var result = parseInt(input, 10);
                assert.ok(isNaN(result), "Expected NaN for input: " + input);
            });
        });

        it("should safely truncate numeric-prefixed injection payloads", function() {
            // parseInt stops at first non-numeric char, never executing code
            var result = parseInt("1+1; process.mainModule.require('child_process').exec('id')", 10);
            assert.strictEqual(result, 1, "Should parse leading digit only, not execute expression");
        });

        it("should return NaN for empty and non-numeric strings", function() {
            assert.ok(isNaN(parseInt("", 10)));
            assert.ok(isNaN(parseInt("abc", 10)));
            assert.ok(isNaN(parseInt(undefined, 10)));
        });

        it("should truncate decimal strings to integers", function() {
            assert.strictEqual(parseInt("10.5", 10), 10);
            assert.strictEqual(parseInt("7.9", 10), 7);
        });
    });

    describe("contributions.js no longer contains eval()", function() {
        it("should not use eval() in the contributions handler", function() {
            var fs = require("fs");
            var path = require("path");
            var filePath = path.join(__dirname, "../../app/routes/contributions.js");
            var source = fs.readFileSync(filePath, "utf8");
            var lines = source.split("\n");
            lines.forEach(function(line) {
                var trimmed = line.trim();
                if (trimmed.indexOf("//") === 0 || trimmed.indexOf("/*") === 0 || trimmed.indexOf("*") === 0) {
                    return;
                }
                assert.ok(
                    trimmed.indexOf("eval(") === -1,
                    "Found eval() in non-comment line: " + trimmed
                );
            });
        });
    });

    describe("error handler renders generic message", function() {
        it("should not pass raw error objects to the template", function() {
            var fs = require("fs");
            var path = require("path");
            var filePath = path.join(__dirname, "../../app/routes/error.js");
            var source = fs.readFileSync(filePath, "utf8");
            assert.ok(
                source.indexOf("error: err") === -1,
                "Error handler should not pass raw err to template"
            );
        });

        it("should render a generic error message", function() {
            var fs = require("fs");
            var path = require("path");
            var filePath = path.join(__dirname, "../../app/routes/error.js");
            var source = fs.readFileSync(filePath, "utf8");
            assert.ok(
                source.indexOf("An unexpected error has occurred") !== -1,
                "Error handler should render a generic error message"
            );
        });
    });

    describe("error template uses escape filter", function() {
        it("should use |escape filter on the error variable", function() {
            var fs = require("fs");
            var path = require("path");
            var filePath = path.join(__dirname, "../../app/views/error-template.html");
            var source = fs.readFileSync(filePath, "utf8");
            assert.ok(
                source.indexOf("{{error|escape}}") !== -1,
                "Error template should use |escape filter on error variable"
            );
        });
    });
});
