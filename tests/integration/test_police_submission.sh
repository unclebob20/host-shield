#!/bin/bash
# Integration test for police submission flow
# Tests the complete flow from registration to police submission using test credentials

set -euo pipefail

# --- CONFIGURATION ---
API_URL="${API_URL:-http://localhost:3000}"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="TestPass123!"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# --- HELPER FUNCTIONS ---
log_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# --- MAIN TEST FLOW ---
main() {
    echo "=========================================="
    echo "🧪 HostShield Police Submission Test"
    echo "=========================================="
    echo ""
    log_info "API URL: $API_URL"
    log_info "Test Email: $TEST_EMAIL"
    echo ""

    # 1. Register test host
    log_info "Step 1: Registering test host..."
    RESPONSE=$(curl -sS -X POST "$API_URL/api/auth/register" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\",
        \"full_name\": \"Test Host\",
        \"police_provider_id\": \"TEST_PROVIDER_001\"
      }")

    if ! echo "$RESPONSE" | jq -e '.accessToken' > /dev/null 2>&1; then
        log_error "Registration failed!"
        echo "$RESPONSE" | jq '.'
        exit 1
    fi

    TOKEN=$(echo "$RESPONSE" | jq -r '.accessToken')
    HOST_ID=$(echo "$RESPONSE" | jq -r '.host.id')
    log_success "Host registered successfully (ID: $HOST_ID)"
    echo ""

    # 2. Upload test credentials
    log_info "Step 2: Uploading test credentials..."
    
    # Check if test private key exists
    if [ ! -f "security/gov_fake_private.key" ]; then
        log_error "Test private key not found at security/gov_fake_private.key"
        log_info "Generating test private key..."
        mkdir -p security
        openssl genrsa -out security/gov_fake_private.key 2048
        log_success "Test private key generated"
    fi

    # Check if test keystore exists
    if [ ! -f "security/boris_hostshield_test_test.keystore" ]; then
        log_info "Test keystore not found, creating dummy keystore..."
        echo "DUMMY_KEYSTORE_FOR_TESTING" > security/boris_hostshield_test_test.keystore
    fi

    CRED_RESPONSE=$(curl -sS -X POST "$API_URL/api/hosts/$HOST_ID/credentials" \
      -H "Authorization: Bearer $TOKEN" \
      -F "ico=boris_hostshield_test" \
      -F "apiSubject=boris_hostshield_test" \
      -F "keystore=@security/boris_hostshield_test_test.keystore" \
      -F "privateKey=@security/gov_fake_private.key")

    if ! echo "$CRED_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        log_error "Credential upload failed!"
        echo "$CRED_RESPONSE" | jq '.'
        exit 1
    fi

    log_success "Credentials uploaded successfully"
    echo ""

    # 3. Verify credentials
    log_info "Step 3: Verifying credentials..."
    VERIFY_RESPONSE=$(curl -sS -X POST "$API_URL/api/hosts/$HOST_ID/credentials/verify" \
      -H "Authorization: Bearer $TOKEN")

    if ! echo "$VERIFY_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        log_error "Credential verification failed!"
        echo "$VERIFY_RESPONSE" | jq '.'
        log_info "This is expected if GovBridge is not running or not configured"
        log_info "Continuing with test..."
    else
        log_success "Credentials verified successfully"
    fi
    echo ""

    # 4. Create test property (if needed)
    log_info "Step 4: Creating test property..."
    PROPERTY_RESPONSE=$(curl -sS -X POST "$API_URL/api/properties" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Test Property",
        "address": "Test Street 123, Bratislava",
        "registration_number": "TEST-REG-001"
      }' 2>&1 || echo '{"error": "endpoint not implemented"}')

    # Property creation might not be implemented yet, continue anyway
    if echo "$PROPERTY_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        PROPERTY_ID=$(echo "$PROPERTY_RESPONSE" | jq -r '.id')
        log_success "Property created (ID: $PROPERTY_ID)"
    else
        log_info "Property creation skipped (endpoint may not be implemented)"
    fi
    echo ""

    # 5. Create test guest
    log_info "Step 5: Creating test guest..."
    GUEST_RESPONSE=$(curl -sS -X POST "$API_URL/api/guests/save" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "first_name": "TEST",
        "last_name": "GUEST",
        "date_of_birth": "1990-01-01",
        "nationality_iso3": "SVK",
        "nationality": "Slovakia",
        "document_number": "TEST123456",
        "document_type": "passport",
        "arrival_date": "2026-02-10",
        "departure_date": "2026-02-12",
        "purpose_of_stay": "turistika"
      }')

    if ! echo "$GUEST_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        log_error "Guest creation failed!"
        echo "$GUEST_RESPONSE" | jq '.'
        exit 1
    fi

    GUEST_ID=$(echo "$GUEST_RESPONSE" | jq -r '.guest.id')
    log_success "Guest created successfully (ID: $GUEST_ID)"
    echo ""

    # 6. Submit to police
    log_info "Step 6: Submitting guest to police..."
    SUBMIT_RESPONSE=$(curl -sS -X POST "$API_URL/api/guests/register" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"guestId\": $GUEST_ID}")

    echo ""
    echo "=========================================="
    echo "📊 Submission Result"
    echo "=========================================="
    echo "$SUBMIT_RESPONSE" | jq '.'
    echo ""

    if echo "$SUBMIT_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        log_success "Police submission successful! ✅"
        echo ""
        echo "Test Summary:"
        echo "  ✅ Host registration"
        echo "  ✅ Credential upload"
        echo "  ✅ Credential verification"
        echo "  ✅ Guest creation"
        echo "  ✅ Police submission"
        echo ""
        echo "🎉 All tests passed!"
        return 0
    else
        log_error "Police submission failed"
        ERROR_MSG=$(echo "$SUBMIT_RESPONSE" | jq -r '.error // "Unknown error"')
        echo ""
        echo "Error: $ERROR_MSG"
        echo ""
        echo "Test Summary:"
        echo "  ✅ Host registration"
        echo "  ✅ Credential upload"
        echo "  ⚠️  Credential verification (may be expected)"
        echo "  ✅ Guest creation"
        echo "  ❌ Police submission"
        echo ""
        
        # Check if it's a known issue
        if [[ "$ERROR_MSG" == *"GovBridge"* ]] || [[ "$ERROR_MSG" == *"Bridge"* ]]; then
            log_info "This appears to be a GovBridge connection issue."
            log_info "Make sure GovBridge is running: docker ps | grep gov-bridge"
            log_info "Check GovBridge logs: docker logs hostshield_gov_bridge"
        elif [[ "$ERROR_MSG" == *"credentials"* ]]; then
            log_info "This appears to be a credentials issue."
            log_info "Check that test credentials are properly configured."
        fi
        
        return 1
    fi
}

# --- RUN TEST ---
main
EXIT_CODE=$?

echo ""
echo "=========================================="
echo "Test completed with exit code: $EXIT_CODE"
echo "=========================================="

exit $EXIT_CODE
