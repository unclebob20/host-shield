#!/bin/bash
# Quick start script for testing police connection without real credentials
# This script helps you choose the right testing approach

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

clear
echo "=========================================="
echo "🛡️  HostShield Police Testing Helper"
echo "=========================================="
echo ""
echo "This script helps you test police connections without real credentials."
echo ""

# Function to check if services are running
check_services() {
    echo -e "${BLUE}Checking services...${NC}"
    
    if docker ps | grep -q hostshield_api; then
        echo -e "${GREEN}✓${NC} API Server is running"
    else
        echo -e "${YELLOW}✗${NC} API Server is not running"
        return 1
    fi
    
    if docker ps | grep -q hostshield_db; then
        echo -e "${GREEN}✓${NC} Database is running"
    else
        echo -e "${YELLOW}✗${NC} Database is not running"
        return 1
    fi
    
    if docker ps | grep -q hostshield_gov_api; then
        echo -e "${GREEN}✓${NC} GovBridge is running"
    else
        echo -e "${YELLOW}⚠${NC} GovBridge is not running (optional for basic tests)"
    fi
    
    echo ""
    return 0
}

# Main menu
show_menu() {
    echo "Choose your testing approach:"
    echo ""
    echo "1) 🚀 Quick Test (Automated)"
    echo "   - Runs complete E2E test with mock credentials"
    echo "   - Best for: Daily development, CI/CD"
    echo "   - Time: ~30 seconds"
    echo ""
    echo "2) 📖 View Documentation"
    echo "   - Complete testing guide"
    echo "   - Best for: Understanding the system"
    echo ""
    echo "3) 🔍 Check System Status"
    echo "   - View service status and logs"
    echo "   - Best for: Debugging issues"
    echo ""
    echo "4) 🧪 Manual Testing Guide"
    echo "   - Step-by-step manual testing"
    echo "   - Best for: Learning the API"
    echo ""
    echo "5) 📋 Quick Reference"
    echo "   - Common commands and troubleshooting"
    echo ""
    echo "0) Exit"
    echo ""
    echo -n "Enter your choice [0-5]: "
}

# Option 1: Run automated test
run_automated_test() {
    echo ""
    echo "=========================================="
    echo "Running Automated Test..."
    echo "=========================================="
    echo ""
    
    if ! check_services; then
        echo ""
        echo -e "${YELLOW}Services are not running. Start them first:${NC}"
        echo "  docker-compose up -d"
        echo ""
        read -p "Press Enter to continue..."
        return
    fi
    
    echo "Starting automated test..."
    echo ""
    ./tests/integration/test_police_submission.sh
    
    echo ""
    read -p "Press Enter to continue..."
}

# Option 2: View documentation
view_documentation() {
    echo ""
    echo "=========================================="
    echo "Documentation"
    echo "=========================================="
    echo ""
    echo "Opening comprehensive testing guide..."
    echo ""
    
    if command -v less &> /dev/null; then
        less docs/TESTING_WITHOUT_REAL_CREDENTIALS.md
    else
        cat docs/TESTING_WITHOUT_REAL_CREDENTIALS.md
    fi
}

# Option 3: Check system status
check_status() {
    echo ""
    echo "=========================================="
    echo "System Status"
    echo "=========================================="
    echo ""
    
    echo "Docker Containers:"
    echo "------------------"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep hostshield || echo "No HostShield containers running"
    
    echo ""
    echo "Recent API Logs:"
    echo "----------------"
    if docker ps | grep -q hostshield_api; then
        docker logs hostshield_api --tail 20
    else
        echo "API server is not running"
    fi
    
    echo ""
    echo "Database Status:"
    echo "----------------"
    if docker ps | grep -q hostshield_db; then
        docker exec hostshield_db psql -U user -d hostshield -c "SELECT COUNT(*) as host_count FROM hosts;" 2>/dev/null || echo "Could not connect to database"
    else
        echo "Database is not running"
    fi
    
    echo ""
    read -p "Press Enter to continue..."
}

# Option 4: Manual testing guide
manual_testing_guide() {
    echo ""
    echo "=========================================="
    echo "Manual Testing Guide"
    echo "=========================================="
    echo ""
    
    cat << 'EOF'
Step 1: Register a test host
-----------------------------
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "full_name": "Test Host"
  }'

Save the "accessToken" and "host.id" from the response.

Step 2: Upload test credentials
--------------------------------
curl -X POST http://localhost:3000/api/hosts/HOST_ID/credentials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "ico=boris_hostshield_test" \
  -F "apiSubject=boris_hostshield_test" \
  -F "privateKey=@security/gov_fake_private.key"

Step 3: Verify credentials
---------------------------
curl -X POST http://localhost:3000/api/hosts/HOST_ID/credentials/verify \
  -H "Authorization: Bearer YOUR_TOKEN"

Step 4: Create a test guest
----------------------------
curl -X POST http://localhost:3000/api/guests/save \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "TEST",
    "last_name": "GUEST",
    "date_of_birth": "1990-01-01",
    "nationality_iso3": "SVK",
    "document_number": "TEST123456",
    "arrival_date": "2026-02-10",
    "departure_date": "2026-02-12"
  }'

Save the "guest.id" from the response.

Step 5: Submit to police
-------------------------
curl -X POST http://localhost:3000/api/guests/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"guestId": GUEST_ID}'

EOF
    
    echo ""
    read -p "Press Enter to continue..."
}

# Option 5: Quick reference
quick_reference() {
    echo ""
    echo "=========================================="
    echo "Quick Reference"
    echo "=========================================="
    echo ""
    
    if command -v less &> /dev/null; then
        less docs/TESTING_QUICK_REFERENCE.md
    else
        cat docs/TESTING_QUICK_REFERENCE.md
    fi
}

# Main loop
while true; do
    clear
    echo "=========================================="
    echo "🛡️  HostShield Police Testing Helper"
    echo "=========================================="
    echo ""
    
    show_menu
    read -r choice
    
    case $choice in
        1) run_automated_test ;;
        2) view_documentation ;;
        3) check_status ;;
        4) manual_testing_guide ;;
        5) quick_reference ;;
        0) 
            echo ""
            echo "Goodbye!"
            echo ""
            exit 0
            ;;
        *)
            echo ""
            echo "Invalid choice. Please try again."
            sleep 2
            ;;
    esac
done
