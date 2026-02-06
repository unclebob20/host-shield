#!/bin/bash
set -e

DIR="security"
mkdir -p "$DIR"

echo "🧹 Cleaning security directory (preserving hosts/)..."
find "$DIR" -maxdepth 1 -type f -delete

echo "🔑 Generating RSA Private Key..."
openssl genrsa -out "$DIR/gov_fake_private.key" 2048

echo "🔓 Generating Public Key (PEM)..."
openssl rsa -in "$DIR/gov_fake_private.key" -pubout -out "$DIR/gov_fake_public.pem"

echo "📜 Generating Self-Signed Certificate..."
openssl req -new -x509 -key "$DIR/gov_fake_private.key" -out "$DIR/cert.pem" -days 3650 -subj "/CN=56051026/O=HostShield/C=SK"

echo "📦 Creating PKCS12 Keystore..."
openssl pkcs12 -export \
    -in "$DIR/cert.pem" \
    -inkey "$DIR/gov_fake_private.key" \
    -out "$DIR/host_shield_test_prod.keystore" \
    -name "56051026" \
    -passout pass:changeit

# Cleanup intermediate cert
rm "$DIR/cert.pem"

echo "✅ Keys generated in $DIR/"
ls -l "$DIR"
