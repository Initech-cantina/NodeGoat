/* global describe, it */
"use strict";

var assert = require("assert");

describe("Name field validation (XSS prevention)", function() {
    // These regexes must match the ones in app/routes/session.js
    var FNAME_RE = /^[a-zA-Z\s\-'.]{1,100}$/;
    var LNAME_RE = /^[a-zA-Z\s\-'.]{1,100}$/;

    describe("should accept valid names", function() {
        var validNames = [
            "John",
            "Jane",
            "Mary-Jane",
            "Van Der Berg",
            "Anne Marie"
        ];

        validNames.forEach(function(name) {
            it("accepts " + name, function() {
                assert.ok(FNAME_RE.test(name), "Expected name to be accepted");
                assert.ok(LNAME_RE.test(name), "Expected name to be accepted");
            });
        });
    });

    describe("should reject names containing HTML/JS injection characters", function() {
        var maliciousNames = [
            "<script>alert(1)</script>",
            "<img src=x onerror=fetch>",
            "John<script>",
            "<svg onload=alert(1)>",
            "test&amp;test"
        ];

        maliciousNames.forEach(function(name) {
            it("rejects malicious payload", function() {
                assert.ok(!FNAME_RE.test(name), "Expected name to be rejected");
                assert.ok(!LNAME_RE.test(name), "Expected name to be rejected");
            });
        });
    });

    describe("should reject empty or overlong names", function() {
        it("rejects empty string", function() {
            assert.ok(!FNAME_RE.test(""), "Expected empty string to be rejected");
        });

        it("rejects name longer than 100 characters", function() {
            var longName = new Array(102).join("A");
            assert.ok(!FNAME_RE.test(longName), "Expected overlong name to be rejected");
        });
    });
});

describe("Swig autoescape configuration", function() {
    it("should have autoescape enabled in server.js", function() {
        var fs = require("fs");
        var path = require("path");
        var serverSource = fs.readFileSync(
            path.resolve(__dirname, "../../server.js"),
            "utf8"
        );
        // Verify autoescape is set to true
        assert.ok(
            /swig\.setDefaults\(\{[\s\S]*?autoescape:\s*true[\s\S]*?\}\)/.test(serverSource),
            "Expected swig.setDefaults to have autoescape: true"
        );
        // Verify autoescape is NOT set to false (outside of comments)
        var lines = serverSource.split("\n");
        var activeAutoescapeFalse = lines.some(function(line) {
            var trimmed = line.trim();
            // Skip comment lines
            if (trimmed.indexOf("//") === 0 || trimmed.indexOf("*") === 0 || trimmed.indexOf("/*") === 0) {
                return false;
            }
            return /autoescape:\s*false/.test(trimmed);
        });
        assert.ok(
            !activeAutoescapeFalse,
            "Expected no active autoescape: false in server.js"
        );
    });
});
