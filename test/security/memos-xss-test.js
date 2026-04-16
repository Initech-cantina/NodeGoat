/* jshint scripturl:true */
/* global describe, it */
"use strict";

var marked = require("marked");
var sanitizeHtml = require("sanitize-html");
var assert = require("assert");

// Configure marked the same way server.js does
marked.setOptions({
    sanitize: true
});

// Replicate the sanitized marked wrapper from server.js
function safeMark(input) {
    var rawHtml = marked(input);
    return sanitizeHtml(rawHtml, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            "h1", "h2", "img"
        ]),
        allowedAttributes: Object.assign(
            {},
            sanitizeHtml.defaults.allowedAttributes,
            { img: ["src", "alt", "title"] }
        ),
        allowedSchemes: ["http", "https", "mailto"]
    });
}

describe("Memos XSS sanitization", function() {

    it("should block javascript: URLs via malformed numeric entities", function() {
        // This is the specific marked v0.3.5 bypass payload (WEB-14)
        var payload = "[Click me](javascript&#58this;alert(1))";
        var result = safeMark(payload);
        assert.ok(
            result.indexOf("javascript") === -1,
            "Output should not contain javascript scheme: " + result
        );
    });

    it("should block direct javascript: links", function() {
        var payload = "[Click me](javascript:alert(document.cookie))";
        var result = safeMark(payload);
        assert.ok(
            result.indexOf("javascript:") === -1,
            "Output should not contain javascript: URL: " + result
        );
    });

    it("should block vbscript: links", function() {
        var payload = "[Click me](vbscript:alert(document.cookie))";
        var result = safeMark(payload);
        assert.ok(
            result.indexOf("vbscript:") === -1,
            "Output should not contain vbscript: URL: " + result
        );
    });

    it("should block script tags in memos", function() {
        var payload = "<script>alert(document.cookie)</script>";
        var result = safeMark(payload);
        assert.ok(
            result.indexOf("<script>") === -1,
            "Output should not contain script tags: " + result
        );
    });

    it("should strip dangerous event handler attributes from img tags", function() {
        var payload = "<img src=x onerror=alert(1)>";
        var result = safeMark(payload);
        // The output may HTML-escape the tag or strip the attribute.
        // Either way, an unescaped <img with onerror= must not appear.
        var hasUnsafeImg = /<img[^>]+onerror/i.test(result);
        assert.ok(
            !hasUnsafeImg,
            "Output should not contain an img with onerror handler: " + result
        );
    });

    it("should allow safe HTTPS links", function() {
        var payload = "[Example](https://example.com)";
        var result = safeMark(payload);
        assert.ok(
            result.indexOf("https://example.com") !== -1,
            "Output should contain the HTTPS link: " + result
        );
    });

    it("should allow safe mailto links", function() {
        var payload = "[Email](mailto:user@example.com)";
        var result = safeMark(payload);
        assert.ok(
            result.indexOf("mailto:user@example.com") !== -1,
            "Output should contain the mailto link: " + result
        );
    });

    it("should render normal markdown correctly", function() {
        var payload = "**bold text** and *italic text*";
        var result = safeMark(payload);
        assert.ok(
            result.indexOf("<strong>bold text</strong>") !== -1,
            "Output should contain bold markup: " + result
        );
        assert.ok(
            result.indexOf("<em>italic text</em>") !== -1,
            "Output should contain italic markup: " + result
        );
    });

    it("should block data: URI scheme", function() {
        var payload = "[Click](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)";
        var result = safeMark(payload);
        assert.ok(
            result.indexOf("data:") === -1,
            "Output should not contain data: URI: " + result
        );
    });

    it("should block hex-encoded javascript entity bypass", function() {
        var payload = "[Click me](javascript&#x3a;alert(1))";
        var result = safeMark(payload);
        assert.ok(
            result.indexOf("javascript") === -1,
            "Output should not contain javascript via hex entity: " + result
        );
    });
});
