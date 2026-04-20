"use strict";

var assert = require("assert");
var marked = require("marked");
var sanitizeHtml = require("sanitize-html");

// Mirror the server.js configuration exactly
var renderer = new marked.Renderer();
renderer.link = function(href, title, text) {
    // Decode HTML entities to reveal obfuscated schemes
    var decoded = href
        .replace(/&amp;/g, "&")
        .replace(/&#(\d+)\w*;/g, function(m, n) {
            return String.fromCharCode(parseInt(n, 10));
        })
        .replace(/&#x([0-9a-fA-F]+)\w*;/g, function(m, h) {
            return String.fromCharCode(parseInt(h, 16));
        });
    var normalized = decoded.replace(/[\x00-\x1f\x7f\s]/g, "").toLowerCase();
    if (/^(javascript|vbscript|data):/i.test(normalized)) {
        return text;
    }
    var out = "<a href=\"" + href + "\"";
    if (title) {
        out += " title=\"" + title + "\"";
    }
    out += ">" + text + "</a>";
    return out;
};

marked.setOptions({
    sanitize: true,
    renderer: renderer
});

function safeMarked(text) {
    var rendered = marked(text);
    return sanitizeHtml(rendered, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        allowedAttributes: {
            "a": ["href", "name", "target"],
            "img": ["src", "alt"]
        },
        allowedSchemes: ["http", "https", "mailto"]
    });
}

describe("Memos XSS sanitization", function() {

    describe("malicious payloads are neutralized", function() {

        it("should strip javascript: via malformed numeric entity bypass", function() {
            var payload = "[Click me](javascript&#58this;alert(1))";
            var result = safeMarked(payload);
            assert.ok(result.indexOf("javascript:") === -1,
                "Output should not contain javascript: URL: " + result);
            assert.ok(result.indexOf("<a") === -1,
                "Output should not contain a link element: " + result);
        });

        it("should strip direct javascript: links", function() {
            var payload = "[Click me](javascript:alert(1))";
            var result = safeMarked(payload);
            assert.ok(result.indexOf("javascript:") === -1,
                "Output should not contain javascript: scheme: " + result);
        });

        it("should strip vbscript: links", function() {
            var payload = "[Click me](vbscript:MsgBox(1))";
            var result = safeMarked(payload);
            assert.ok(result.indexOf("vbscript:") === -1,
                "Output should not contain vbscript: scheme: " + result);
        });

        it("should strip data: links", function() {
            var payload = "[Click me](data:text/html,<script>alert(1)</script>)";
            var result = safeMarked(payload);
            assert.ok(result.indexOf("data:") === -1,
                "Output should not contain data: scheme: " + result);
        });

        it("should strip inline script tags", function() {
            var payload = "<script>alert(1)</script>";
            var result = safeMarked(payload);
            assert.ok(result.indexOf("<script") === -1,
                "Output should not contain script tags: " + result);
        });

        it("should strip event handlers from raw HTML (entity-escaped by marked sanitize)", function() {
            var payload = "<img src=x onerror=alert(1)>";
            var result = safeMarked(payload);
            // marked sanitize:true entity-escapes raw HTML, making it safe
            assert.ok(result.indexOf("<img") === -1,
                "Output should not contain unescaped img tag: " + result);
        });

        it("should strip hex-encoded javascript: entity bypass", function() {
            var payload = "[Click me](javascript&#x3A;alert(1))";
            var result = safeMarked(payload);
            assert.ok(result.indexOf("javascript:") === -1,
                "Output should not contain javascript: scheme: " + result);
            assert.ok(result.indexOf("<a") === -1,
                "Output should not contain a link element: " + result);
        });

        it("should strip mixed-case JavaScript: scheme", function() {
            var payload = "[Click me](JaVaScRiPt:alert(1))";
            var result = safeMarked(payload);
            assert.ok(result.toLowerCase().indexOf("javascript:") === -1,
                "Output should not contain JavaScript: scheme: " + result);
        });
    });

    describe("safe content is preserved", function() {

        it("should allow HTTPS links", function() {
            var payload = "[Safe link](https://example.com)";
            var result = safeMarked(payload);
            assert.ok(result.indexOf("https://example.com") !== -1,
                "Output should contain the HTTPS URL: " + result);
        });

        it("should allow mailto links", function() {
            var payload = "[Email](mailto:user@example.com)";
            var result = safeMarked(payload);
            assert.ok(result.indexOf("mailto:user@example.com") !== -1,
                "Output should contain the mailto URL: " + result);
        });

        it("should render bold and italic text", function() {
            var payload = "**bold** and *italic*";
            var result = safeMarked(payload);
            assert.ok(result.indexOf("<strong>bold</strong>") !== -1,
                "Output should contain bold tag: " + result);
            assert.ok(result.indexOf("<em>italic</em>") !== -1,
                "Output should contain italic tag: " + result);
        });
    });
});
