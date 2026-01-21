#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3000}"

curl -sS -X POST "${API_URL}/api/guests/register" \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName":"TEST",
    "lastName":"USER",
    "dob":"1990-01-01",
    "countryCode":"SVK",
    "passportNumber":"EB123456",
    "arrivalDate":"2026-01-20",
    "departureDate":"2026-01-23"
  }'

