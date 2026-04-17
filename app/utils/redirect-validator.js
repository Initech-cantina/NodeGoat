"use strict";

// Allowlist of trusted external hostnames for the /learn redirect
var ALLOWED_EXTERNAL_HOSTS = [
    "www.khanacademy.org",
    "khanacademy.org"
];

/**
 * Validate that a redirect URL is safe.
 * Permits relative paths (starting with "/" but not "//") and
 * absolute URLs whose hostname is in the trusted allowlist.
 * Returns the validated URL or null if the URL is not permitted.
 */
function getValidRedirectUrl(url) {
    if (typeof url !== "string" || url.length === 0) {
        return null;
    }

    // Block protocol-relative URLs (e.g. "//evil.com")
    if (url.startsWith("//")) {
        return null;
    }

    // Allow safe relative paths
    if (url.startsWith("/")) {
        return url;
    }

    // For absolute URLs, validate against the hostname allowlist
    try {
        var parsed = new URL(url);
        if (
            (parsed.protocol === "http:" || parsed.protocol === "https:") &&
            ALLOWED_EXTERNAL_HOSTS.includes(parsed.hostname)
        ) {
            return url;
        }
    } catch (e) {
        // Malformed URL — reject
        void e;
    }

    return null;
}

module.exports = {
    getValidRedirectUrl: getValidRedirectUrl,
    ALLOWED_EXTERNAL_HOSTS: ALLOWED_EXTERNAL_HOSTS
};
