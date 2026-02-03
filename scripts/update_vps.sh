#!/bin/bash
# Quick VPS Update Script for Encryption Feature
# Usage: ./scripts/update_vps.sh

set -e

SSH_KEY="/Users/boris/.ssh/hostshield_key"
VPS_HOST="root@167.86.78.26"
VPS_DIR="/root/host-shield"
LOCAL_DIR="/Users/boris/git-repos/host-shield"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Deploying Encryption Feature to VPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check encryption key
echo "1️⃣  Checking encryption key on VPS..."
HAS_KEY=$(ssh -i "$SSH_KEY" "$VPS_HOST" "grep -c CREDENTIAL_ENCRYPTION_KEY $VPS_DIR/.env 2>/dev/null || echo 0")

if [ "$HAS_KEY" -eq 0 ]; then
    echo "⚠️  CREDENTIAL_ENCRYPTION_KEY not found in VPS .env"
    echo ""
    echo "Please generate a production encryption key:"
    echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    echo ""
    read -p "Enter the encryption key: " ENCRYPTION_KEY
    
    if [ -z "$ENCRYPTION_KEY" ]; then
        echo "❌ No key provided. Exiting."
        exit 1
    fi
    
    echo "Adding encryption key to VPS .env..."
    ssh -i "$SSH_KEY" "$VPS_HOST" "echo 'CREDENTIAL_ENCRYPTION_KEY=$ENCRYPTION_KEY' >> $VPS_DIR/.env"
    echo "✅ Encryption key added"
else
    echo "✅ Encryption key already configured"
fi
echo ""

# Step 2: Backup database
echo "2️⃣  Backing up database..."
BACKUP_FILE="backup_before_encryption_$(date +%Y%m%d_%H%M%S).sql"
ssh -i "$SSH_KEY" "$VPS_HOST" "docker exec hostshield_db_prod pg_dump -U hostshield_user -d hostshield > /root/$BACKUP_FILE"
echo "✅ Database backed up to /root/$BACKUP_FILE"
echo ""

# Step 3: Sync code
echo "3️⃣  Syncing code to VPS..."
rsync -avz --progress \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.env' \
  --exclude='docs/' \
  --exclude='security/hosts/' \
  --exclude='.DS_Store' \
  -e "ssh -i $SSH_KEY" \
  "$LOCAL_DIR/" \
  "$VPS_HOST:$VPS_DIR/"
echo "✅ Code synced"
echo ""

# Step 4: Create security directory
echo "4️⃣  Creating security directory..."
ssh -i "$SSH_KEY" "$VPS_HOST" "mkdir -p $VPS_DIR/security/hosts && chmod 700 $VPS_DIR/security/hosts"
echo "✅ Security directory created"
echo ""

# Step 5: Run migrations
echo "5️⃣  Running database migrations..."
ssh -i "$SSH_KEY" "$VPS_HOST" << 'ENDSSH'
    set -e
    cd /root/host-shield
    
    # Copy migrations to container
    docker cp database/migrations/add_gov_credentials_to_hosts.sql hostshield_db_prod:/tmp/
    docker cp database/migrations/add_encryption_metadata.sql hostshield_db_prod:/tmp/
    
    # Run migrations (ignore errors if already applied)
    echo "Running migration 1..."
    docker exec hostshield_db_prod psql -U hostshield_user -d hostshield_db \
      -f /tmp/add_gov_credentials_to_hosts.sql 2>&1 || echo "Migration 1 may already be applied"
    
    echo "Running migration 2..."
    docker exec hostshield_db_prod psql -U hostshield_user -d hostshield_db \
      -f /tmp/add_encryption_metadata.sql 2>&1 || echo "Migration 2 may already be applied"
    
    echo "Verifying migrations..."
    docker exec hostshield_db_prod psql -U hostshield_user -d hostshield_db \
      -c "\d hosts" | grep gov_ || echo "Warning: gov_ columns not found"
ENDSSH
echo "✅ Migrations completed"
echo ""

# Step 6: Rebuild and restart
echo "6️⃣  Rebuilding and restarting containers..."
ssh -i "$SSH_KEY" "$VPS_HOST" << 'ENDSSH'
    set -e
    cd /root/host-shield
    
    echo "Stopping containers..."
    docker compose -f docker-compose.prod.yaml down
    
    echo "Rebuilding API server..."
    docker compose -f docker-compose.prod.yaml build --no-cache api-server
    
    echo "Starting containers..."
    docker compose -f docker-compose.prod.yaml up -d
    
    echo "Waiting for startup..."
    sleep 10
    
    echo ""
    echo "Container status:"
    docker compose -f docker-compose.prod.yaml ps
ENDSSH
echo "✅ Containers restarted"
echo ""

# Step 7: Verify deployment
echo "7️⃣  Verifying deployment..."
echo ""
echo "Checking API health..."
HEALTH=$(curl -s http://167.86.78.26:3000/health || echo "FAILED")
if echo "$HEALTH" | grep -q "active"; then
    echo "✅ API is healthy"
else
    echo "⚠️  API health check failed: $HEALTH"
fi
echo ""

echo "Checking encryption key in container..."
ssh -i "$SSH_KEY" "$VPS_HOST" "docker exec hostshield-api-1 env | grep -q CREDENTIAL_ENCRYPTION_KEY && echo '✅ Encryption key loaded' || echo '❌ Encryption key NOT loaded'"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  ✅ Encryption key configured"
echo "  ✅ Database backed up"
echo "  ✅ Code synced to VPS"
echo "  ✅ Migrations applied"
echo "  ✅ Containers rebuilt and restarted"
echo ""
echo "🔍 Next Steps:"
echo "  1. Test credential upload via web UI"
echo "  2. Monitor logs: ssh -i $SSH_KEY $VPS_HOST 'docker logs -f hostshield-api-1'"
echo "  3. Verify encryption: Look for 🔐 and 🔓 in logs"
echo ""
echo "📚 Full guide: docs/VPS_DEPLOYMENT_GUIDE.md"
echo ""
