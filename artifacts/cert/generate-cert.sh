#!/usr/bin/env bash
# Generate a self-signed certificate for local development only.
# Do NOT use these certificates in production.
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "$DIR/server.key" \
  -out "$DIR/server.crt" \
  -days 365 \
  -subj "/CN=localhost" \
  -sha256

echo "Generated self-signed cert and key in $DIR"
echo "  server.key  (DO NOT commit this file)"
echo "  server.crt"
