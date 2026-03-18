# TLS Certificates for Local Development

The private key and certificate files (`server.key`, `server.crt`) are **not** checked into this repository.

## Generate a local self-signed certificate

```bash
cd artifacts/cert
chmod +x generate-cert.sh
./generate-cert.sh
```

This creates `server.key` and `server.crt` for local HTTPS testing.

## Production deployments

For production, provision certificates through your organization's PKI or a service like Let's Encrypt, and provide them via environment variables or a secrets manager — never commit them to source control.
