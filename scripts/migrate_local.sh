#!/bin/bash
# Local Migration Script for Multi-Tenant Credentials
# Run this on your Mac for local testing

set -e  # Exit on error

echo "🚀 Starting Local Multi-Tenant Migration..."
echo ""

# Get database connection info from .env or use defaults from compose.yaml
DB_USER="${DB_USER:-user}"
DB_NAME="${DB_NAME:-hostshield}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo "📋 Configuration:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST:$DB_PORT"
echo ""

# Check if database is running
echo "🔍 Checking database connection..."
DB_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E '(hostshield.*db|hostshield-db)' | grep -v gov | head -n1)

if [ -z "$DB_CONTAINER" ]; then
    echo "❌ Database container not running!"
    echo "   Start it with: docker compose up -d db"
    exit 1
fi

echo "✅ Database is running (container: $DB_CONTAINER)"
echo ""

# Run migration
echo "📋 Step 1: Running database migration..."
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
    -f /docker-entrypoint-initdb.d/migrations/add_gov_credentials_to_hosts.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully"
else
    echo "❌ Migration failed!"
    exit 1
fi
echo ""

# Verify migration
echo "📋 Step 2: Verifying migration..."
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
    -c "\d hosts" | grep -q "gov_ico"

if [ $? -eq 0 ]; then
    echo "✅ New columns added successfully"
else
    echo "❌ Verification failed - columns not found"
    exit 1
fi
echo ""

# Create security directory
echo "📋 Step 3: Creating security directories..."
mkdir -p security/hosts
chmod 700 security/hosts
echo "✅ Security directories created"
echo ""

# Restart API server if running
echo "📋 Step 4: Restarting API server..."
API_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E '(hostshield.*api|host-shield-api)' | grep -v gov | head -n1)
if [ -n "$API_CONTAINER" ]; then
    docker restart "$API_CONTAINER"
    echo "✅ API server restarted (container: $API_CONTAINER)"
else
    echo "⚠️  API server not running - start it with: docker compose up -d api-server"
fi
echo ""

echo "✅ Local migration complete!"
echo ""
echo "📝 Next steps:"
echo "1. Test credential upload:"
echo "   curl http://localhost:3000/api/hosts/1/credentials/status \\"
echo "     -H \"Authorization: Bearer YOUR_TOKEN\""
echo ""
echo "2. Check the database:"
echo "   docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME \\"
echo "     -c 'SELECT id, email, gov_ico, gov_credentials_verified FROM hosts;'"
echo ""
echo "See docs/LOCAL_TESTING_GUIDE.md for complete testing guide"
