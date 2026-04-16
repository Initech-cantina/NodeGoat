"use strict";

/* jshint mocha: true */

var swig = require("swig");
var assert = require("assert");

describe("Swig template autoescape configuration", function() {

    // Re-apply the same configuration as server.js to test it
    before(function() {
        swig.setDefaults({
            autoescape: true
        });
    });

    it("should HTML-escape user-controlled strings by default", function() {
        var template = swig.compile("Hello {{ name }}");
        var output = template({ name: "<script>alert('xss')</script>" });
        assert.strictEqual(
            output,
            "Hello &lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;",
            "Template output must HTML-escape angle brackets and quotes"
        );
    });

    it("should escape double quotes in HTML attribute contexts", function() {
        var template = swig.compile("<input value=\"{{ value }}\">");
        var output = template({ value: "\" onmouseover=\"alert(1)" });
        assert.ok(
            output.indexOf("\" onmouseover=") === -1,
            "Double quotes in user input must be escaped to prevent attribute breakout"
        );
    });

    it("should not contain raw XSS payloads in rendered output", function() {
        var template = swig.compile("<div>{{ content }}</div>");
        var output = template({ content: "<img src=x onerror=alert(1)>" });
        assert.ok(
            output.indexOf("<img") === -1,
            "HTML tags in user input must be escaped, not rendered as raw HTML"
        );
    });

    it("should verify server.js sets autoescape to true", function() {
        var fs = require("fs");
        var path = require("path");
        var serverPath = path.resolve(__dirname, "../../server.js");
        var serverSource = fs.readFileSync(serverPath, "utf8");

        // Match the swig.setDefaults call and verify autoescape is true
        var match = serverSource.match(/swig\.setDefaults\(\{[^}]*autoescape:\s*(true|false)/);
        assert.ok(match, "server.js must contain swig.setDefaults with autoescape setting");
        assert.strictEqual(
            match[1],
            "true",
            "server.js must set autoescape: true to prevent XSS"
        );
    });
});
