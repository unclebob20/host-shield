#!/bin/bash
# Multi-Tenant Migration Script
# This script migrates HostShield to support per-host government credentials

set -e  # Exit on error

echo "🚀 Starting Multi-Tenant Migration..."

# Configuration
VPS_HOST="root@167.86.78.26"
SSH_KEY="/Users/boris/.ssh/hostshield_key"
PROJECT_DIR="/root/host-shield"

echo ""
echo "📋 Step 1: Upload migration file to VPS..."
scp -i "$SSH_KEY" database/migrations/add_gov_credentials_to_hosts.sql "$VPS_HOST:$PROJECT_DIR/database/migrations/"

echo ""
echo "📋 Step 2: Run database migration..."
ssh -i "$SSH_KEY" "$VPS_HOST" "docker exec hostshield-db-1 psql -U hostshield_user -d hostshield_db -f /docker-entrypoint-initdb.d/migrations/add_gov_credentials_to_hosts.sql"

echo ""
echo "📋 Step 3: Upload updated service files..."
scp -i "$SSH_KEY" apps/api-server/src/services/govBridgeService.js "$VPS_HOST:$PROJECT_DIR/apps/api-server/src/services/"
scp -i "$SSH_KEY" apps/api-server/src/controllers/guestController.js "$VPS_HOST:$PROJECT_DIR/apps/api-server/src/controllers/"

echo ""
echo "📋 Step 4: Rebuild and restart API server..."
ssh -i "$SSH_KEY" "$VPS_HOST" "cd $PROJECT_DIR && docker compose -f docker-compose.prod.yaml up -d --build api-server"

echo ""
echo "📋 Step 5: Verify migration..."
ssh -i "$SSH_KEY" "$VPS_HOST" "docker exec hostshield-db-1 psql -U hostshield_user -d hostshield_db -c '\\d hosts'"

echo ""
echo "✅ Migration complete!"
echo ""
echo "📝 Next steps:"
echo "1. Test existing functionality (should work with fallback credentials)"
echo "2. Configure first host's credentials in database"
echo "3. Test submission with real host credentials"
echo ""
echo "See docs/MULTI_TENANT_IMPLEMENTATION_SUMMARY.md for details"
