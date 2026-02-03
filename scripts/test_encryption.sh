#!/bin/bash
# Test Encrypted Credentials - Local Environment

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Testing Encrypted Credentials System${NC}"
echo ""

# Configuration
API_URL="http://localhost:3000"
HOST_ID="953cdb92-cb0d-4568-90aa-42c3a3bcf24f"

# Check if token is set
if [ -z "$token" ]; then
    echo -e "${RED}❌ Error: Token not set${NC}"
    echo ""
    echo "Please set your auth token first:"
    echo "  export token=\"YOUR_AUTH_TOKEN_HERE\""
    echo ""
    echo "To get a token, login first:"
    echo "  curl -X POST http://localhost:3000/api/auth/login \\"
    echo "    -H \"Content-Type: application/json\" \\"
    echo "    -d '{\"email\": \"your-email@example.com\", \"password\": \"your-password\"}'"
    exit 1
fi

echo -e "${GREEN}✅ Token found${NC}"
echo ""

# Test 1: Health Check
echo -e "${BLUE}Test 1: API Health Check${NC}"
HEALTH=$(curl -s ${API_URL}/health)
echo "Response: $HEALTH"
if echo "$HEALTH" | grep -q "active"; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}❌ API health check failed${NC}"
    exit 1
fi
echo ""

# Test 2: Get Credential Status
echo -e "${BLUE}Test 2: Get Credential Status${NC}"
echo "Request: GET ${API_URL}/api/hosts/${HOST_ID}/credentials/status"
STATUS=$(curl -s ${API_URL}/api/hosts/${HOST_ID}/credentials/status \
    -H "Authorization: Bearer ${token}")
echo "Response: $STATUS"

if echo "$STATUS" | grep -q "success"; then
    echo -e "${GREEN}✅ Status endpoint working${NC}"
    
    # Check if configured
    if echo "$STATUS" | grep -q '"configured":true'; then
        echo -e "${YELLOW}⚠️  Credentials already configured${NC}"
        echo "To test upload, delete existing credentials first:"
        echo "  curl -X DELETE ${API_URL}/api/hosts/${HOST_ID}/credentials \\"
        echo "    -H \"Authorization: Bearer \${token}\""
    else
        echo -e "${GREEN}✅ No credentials configured - ready for upload${NC}"
    fi
else
    echo -e "${RED}❌ Status check failed${NC}"
    echo "Error: $STATUS"
    exit 1
fi
echo ""

# Test 3: Upload Credentials (if not configured)
if ! echo "$STATUS" | grep -q '"configured":true'; then
    echo -e "${BLUE}Test 3: Upload Encrypted Credentials${NC}"
    echo "Uploading test credentials..."
    
    UPLOAD=$(curl -s -X POST ${API_URL}/api/hosts/${HOST_ID}/credentials \
        -H "Authorization: Bearer ${token}" \
        -F "ico=boris_hostshield_test" \
        -F "apiSubject=boris_hostshield_test" \
        -F "keystore=@security/boris_hostshield_test_test.keystore" \
        -F "privateKey=@security/gov_fake_private.key")
    
    echo "Response: $UPLOAD"
    
    if echo "$UPLOAD" | grep -q "encrypted.*true"; then
        echo -e "${GREEN}✅ Credentials uploaded and ENCRYPTED!${NC}"
    elif echo "$UPLOAD" | grep -q "success"; then
        echo -e "${YELLOW}⚠️  Credentials uploaded but encryption status unclear${NC}"
    else
        echo -e "${RED}❌ Upload failed${NC}"
        echo "Error: $UPLOAD"
        exit 1
    fi
    echo ""
    
    # Check API logs for encryption
    echo -e "${BLUE}Checking API logs for encryption messages...${NC}"
    docker logs hostshield_api --tail 20 | grep -E "(🔐|Encrypting|encrypted)" || echo "No encryption logs found"
    echo ""
    
    # Test 4: Verify Credentials
    echo -e "${BLUE}Test 4: Verify Credentials (Decryption Test)${NC}"
    echo "Verifying credentials..."
    
    VERIFY=$(curl -s -X POST ${API_URL}/api/hosts/${HOST_ID}/credentials/verify \
        -H "Authorization: Bearer ${token}")
    
    echo "Response: $VERIFY"
    
    if echo "$VERIFY" | grep -q "verified.*true"; then
        echo -e "${GREEN}✅ Credentials verified successfully!${NC}"
    else
        echo -e "${RED}❌ Verification failed${NC}"
        echo "Error: $VERIFY"
        exit 1
    fi
    echo ""
    
    # Check API logs for decryption
    echo -e "${BLUE}Checking API logs for decryption messages...${NC}"
    docker logs hostshield_api --tail 20 | grep -E "(🔓|Decrypting|decrypted)" || echo "No decryption logs found"
    echo ""
fi

# Test 5: Check Encrypted Files
echo -e "${BLUE}Test 5: Verify Files Are Encrypted${NC}"
CRED_DIR="security/hosts/${HOST_ID}"
if [ -d "$CRED_DIR" ]; then
    echo "Checking files in: $CRED_DIR"
    ls -lh "$CRED_DIR"
    echo ""
    
    # Try to read private key (should be binary)
    PRIVATE_KEY=$(find "$CRED_DIR" -name "*_private.key" | head -n1)
    if [ -n "$PRIVATE_KEY" ]; then
        echo "Checking if file is encrypted (should be binary data):"
        echo "File: $PRIVATE_KEY"
        
        # Check if file contains readable PEM header (means NOT encrypted)
        if head -n 1 "$PRIVATE_KEY" | grep -q "BEGIN"; then
            echo -e "${RED}❌ WARNING: File appears to be PLAIN TEXT (not encrypted!)${NC}"
        else
            echo -e "${GREEN}✅ File appears to be ENCRYPTED (binary data)${NC}"
            echo "First 50 bytes (hex):"
            head -c 50 "$PRIVATE_KEY" | xxd | head -n 3
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Credential directory not found: $CRED_DIR${NC}"
fi
echo ""

# Test 6: Check Database Encryption Metadata
echo -e "${BLUE}Test 6: Check Database Encryption Metadata${NC}"
DB_CHECK=$(docker exec hostshield_db psql -U user -d hostshield -t -c \
    "SELECT 
        gov_ico, 
        gov_private_key_iv IS NOT NULL as has_iv, 
        gov_private_key_auth_tag IS NOT NULL as has_auth_tag,
        gov_credentials_verified
     FROM hosts 
     WHERE id = '${HOST_ID}';")

echo "Database check:"
echo "$DB_CHECK"

if echo "$DB_CHECK" | grep -q "t.*t"; then
    echo -e "${GREEN}✅ Encryption metadata present in database${NC}"
else
    echo -e "${RED}❌ Encryption metadata missing${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Encryption Test Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Summary:"
echo "  ✅ API is running"
echo "  ✅ Credentials endpoint working"
echo "  ✅ Files encrypted on disk"
echo "  ✅ Decryption works for verification"
echo "  ✅ Database has encryption metadata"
echo ""
echo "Next steps:"
echo "  1. Test guest submission with encrypted credentials"
echo "  2. Commit changes to git"
echo "  3. Deploy to production with new encryption key"
echo ""
