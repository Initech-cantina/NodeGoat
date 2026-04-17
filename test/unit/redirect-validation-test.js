/* jshint mocha: true, scripturl: true */
"use strict";

var assert = require("assert");
var getValidRedirectUrl = require("../../app/utils/redirect-validator").getValidRedirectUrl;

describe("getValidRedirectUrl", function() {

    describe("relative paths", function() {
        it("should allow a simple relative path", function() {
            assert.strictEqual(getValidRedirectUrl("/dashboard"), "/dashboard");
        });

        it("should allow a relative path with query parameters", function() {
            assert.strictEqual(
                getValidRedirectUrl("/profile?tab=settings"),
                "/profile?tab=settings"
            );
        });

        it("should block protocol-relative URLs", function() {
            assert.strictEqual(getValidRedirectUrl("//evil.com"), null);
        });

        it("should block protocol-relative URLs with paths", function() {
            assert.strictEqual(getValidRedirectUrl("//evil.com/phish"), null);
        });
    });

    describe("absolute URLs", function() {
        it("should allow URLs to trusted khanacademy.org domain", function() {
            var url = "https://www.khanacademy.org/economics-finance-domain/core-finance";
            assert.strictEqual(getValidRedirectUrl(url), url);
        });

        it("should allow URLs to khanacademy.org without www", function() {
            var url = "https://khanacademy.org/some-path";
            assert.strictEqual(getValidRedirectUrl(url), url);
        });

        it("should block URLs to untrusted external domains", function() {
            assert.strictEqual(getValidRedirectUrl("https://evil.com/phish"), null);
        });

        it("should block URLs to untrusted domains resembling trusted ones", function() {
            assert.strictEqual(
                getValidRedirectUrl("https://www.khanacademy.org.evil.com/"),
                null
            );
        });

        it("should block URLs with javascript: scheme", function() {
            assert.strictEqual(getValidRedirectUrl("javascript:alert(1)"), null);
        });

        it("should block URLs with data: scheme", function() {
            var dataUrl = "data:text/html,%3Cscript%3Ealert(1)%3C/script%3E";
            assert.strictEqual(getValidRedirectUrl(dataUrl), null);
        });

        it("should block HTTP URLs to untrusted domains", function() {
            assert.strictEqual(getValidRedirectUrl("http://attacker.com"), null);
        });
    });

    describe("edge cases", function() {
        it("should return null for empty string", function() {
            assert.strictEqual(getValidRedirectUrl(""), null);
        });

        it("should return null for undefined", function() {
            assert.strictEqual(getValidRedirectUrl(undefined), null);
        });

        it("should return null for null", function() {
            assert.strictEqual(getValidRedirectUrl(null), null);
        });

        it("should return null for non-string input", function() {
            assert.strictEqual(getValidRedirectUrl(12345), null);
        });
    });
});
