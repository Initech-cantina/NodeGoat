"use strict";

var AllocationsHandler = require("../../app/routes/allocations");

// Minimal mock helpers
function createMockDb() {
    return {
        collection: function () {
            return {
                find: function () {
                    return {
                        toArray: function (cb) { cb(null, []); }
                    };
                }
            };
        }
    };
}

function createMockReq(params, query, session) {
    return {
        params: params || {},
        query: query || {},
        session: session || {}
    };
}

function createMockRes() {
    var res = {
        statusCode: null,
        body: null,
        rendered: null,
        status: function (code) {
            res.statusCode = code;
            return res;
        },
        send: function (body) {
            res.body = body;
            return res;
        },
        render: function (view, data) {
            res.rendered = { view: view, data: data };
            return res;
        }
    };
    return res;
}

// Test runner (no external dependencies required)
var passed = 0;
var failed = 0;

function assert(condition, message) {
    if (condition) {
        passed++;
        console.log("  PASS " + message);
    } else {
        failed++;
        console.error("  FAIL " + message);
    }
}

console.log("Allocations reflected XSS regression tests\n");

var db = createMockDb();
var handler = new AllocationsHandler(db);

// Test 1: Valid numeric userId is accepted
(function () {
    var req = createMockReq({ userId: "1" }, {});
    var res = createMockRes();
    handler.displayAllocations(req, res, function () {});
    assert(res.statusCode !== 400, "Numeric userId should not be rejected");
})();

// Test 2: XSS payload in userId is rejected with 400
(function () {
    var xssPayload = "1\"><img src=x onerror=alert(1)>";
    var req = createMockReq({ userId: xssPayload }, {});
    var res = createMockRes();
    handler.displayAllocations(req, res, function () {});
    assert(res.statusCode === 400, "XSS payload in userId should return 400");
    assert(res.body === "Invalid userId", "Response body should indicate invalid userId");
})();

// Test 3: Script injection payload is rejected
(function () {
    var payload = "1\"><script>alert(1)</script>";
    var req = createMockReq({ userId: payload }, {});
    var res = createMockRes();
    handler.displayAllocations(req, res, function () {});
    assert(res.statusCode === 400, "Script injection payload should return 400");
})();

// Test 4: Empty userId is rejected
(function () {
    var req = createMockReq({ userId: "" }, {});
    var res = createMockRes();
    handler.displayAllocations(req, res, function () {});
    assert(res.statusCode === 400, "Empty userId should return 400");
})();

// Test 5: Alphabetic userId is rejected
(function () {
    var req = createMockReq({ userId: "abc" }, {});
    var res = createMockRes();
    handler.displayAllocations(req, res, function () {});
    assert(res.statusCode === 400, "Alphabetic userId should return 400");
})();

// Test 6: userId with special characters is rejected
(function () {
    var req = createMockReq({ userId: "1;DROP TABLE" }, {});
    var res = createMockRes();
    handler.displayAllocations(req, res, function () {});
    assert(res.statusCode === 400, "userId with special characters should return 400");
})();

// Test 7: Valid multi-digit userId is accepted
(function () {
    var req = createMockReq({ userId: "12345" }, {});
    var res = createMockRes();
    handler.displayAllocations(req, res, function () {});
    assert(res.statusCode !== 400, "Multi-digit numeric userId should not be rejected");
})();

// Summary
console.log("\n" + passed + " passed, " + failed + " failed");
if (failed > 0) {
    process.exit(1);
}
