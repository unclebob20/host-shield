#!/bin/bash
set -e

# Configuration
BASE_URL="http://localhost:8001"
SERVICE_ENDPOINT="$BASE_URL/extract-mrz"
SAMPLE_DIR="samples"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "--- HostShield MRZ Service Verification ---"
echo "Target: $SERVICE_ENDPOINT"

# Check if service is up
echo "Checking health..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}Error: MRZ Service is not reachable at $BASE_URL${NC}"
    echo "Please ensure the docker container is running: docker compose up -d mrz-reader"
    echo "Note: If running on Docker, ensure port 8001 is mapped."
    exit 1
fi
echo -e "${GREEN}Service is UP${NC}"

# Handle samples directory location
if [ ! -d "$SAMPLE_DIR" ]; then
    if [ -d "../../samples" ]; then
        SAMPLE_DIR="../../samples"
    elif [ -d "../samples" ]; then
        SAMPLE_DIR="../samples"
    fi
fi

if [ ! -d "$SAMPLE_DIR" ]; then
    echo -e "${RED}Error: 'samples' directory not found.${NC}"
    echo "Please run this script from the project root or verify samples location."
    exit 1
fi
echo "Using samples from: $SAMPLE_DIR"

# Function to test a file
test_file() {
    local file=$1
    echo "Testing file: $file"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}File not found: $file${NC}"
        return
    fi
    
    response=$(curl -s -X POST -F "file=@$file" "$SERVICE_ENDPOINT")
    
    # Check for success
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}[PASSED] Extraction successful${NC}"
        # Check for new field
        if echo "$response" | grep -q '"document_expiry_date"'; then
             echo -e "${GREEN}[PASSED] Found 'document_expiry_date' field${NC}"
             # Optional: Print the expiry date to verify
             # expiry=$(echo $response | grep -o '"document_expiry_date":"[^"]*"' | cut -d'"' -f4)
             # echo "  Expiry: $expiry"
        else
             echo -e "${RED}[FAILED] Missing 'document_expiry_date' (Old API version?)${NC}"
             echo "Response: $response"
        fi
    else
        echo -e "${RED}[FAILED] Extraction failed${NC}"
        echo "Response snippet: $(echo "$response" | cut -c 1-100)..."
    fi
    echo "----------------------------------------"
}

# Run tests on samples
count=0
for f in "$SAMPLE_DIR"/*.jpg "$SAMPLE_DIR"/*.pdf "$SAMPLE_DIR"/*.png; do
    [ -e "$f" ] || continue
    test_file "$f"
    count=$((count+1))
done

if [ "$count" -eq 0 ]; then
    echo "No supported files (jpg, pdf, png) found in $SAMPLE_DIR"
fi
