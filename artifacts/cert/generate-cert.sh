#!/usr/bin/env bash
# Generate a self-signed TLS certificate for local development.
# Usage: ./generate-cert.sh
#
# This creates server.key and server.crt in the current directory.
# These files are git-ignored and must NEVER be committed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout "${SCRIPT_DIR}/server.key" \
  -out "${SCRIPT_DIR}/server.crt" \
  -days 365 \
  -subj "/CN=localhost/O=NodeGoat-Dev"

echo "Generated self-signed cert at:"
echo "   ${SCRIPT_DIR}/server.key"
echo "   ${SCRIPT_DIR}/server.crt"
echo ""
echo "These files are git-ignored. Do NOT commit them."
