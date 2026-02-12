#!/bin/bash
set -e

# Configuration
SERVER_IP="167.86.78.26"
SERVER_USER="root"
REMOTE_DIR="/opt/hostshield"
SSH_KEY="~/.ssh/hostshield_key"

echo "🚀 Starting Deployment to $SERVER_IP..."

# 1. Sync Files (Rsync is faster than SCP/Tar)
# We sync apps, production, and database directories.
# We exclude node_modules to save massive bandwidth/time.
# 0. Check for APK
if [ ! -f "downloads/hostshield.apk" ]; then
    echo "⚠️  WARNING: downloads/hostshield.apk not found!"
    echo "   The download link on the site will return 404."
    echo "   Place your APK file in the 'downloads' folder before deploying."
    echo "   Continuing in 5 seconds..."
    sleep 5
fi

# 1. Sync Files (Rsync is faster than SCP/Tar)
echo "🔄 Syncing code..."
rsync -avz -e "ssh -i $SSH_KEY" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude '.env' \
  --exclude 'security/hosts' \
  apps production database security downloads \
  $SERVER_USER@$SERVER_IP:$REMOTE_DIR/

# 2. Remote Build & Restart
echo "🏗️  Building and Restarting Containers..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP << 'EOF'
    cd /opt/hostshield

    # Refresh docker-compose.yml from the uploaded production version
    cp production/docker-compose.prod.yaml docker-compose.yml
    
    # Reload Nginx Config (if changed in production/nginx)
    mkdir -p nginx
    cp production/nginx/nginx.conf nginx/nginx.conf

    # Apply Path Fixes for VPS Structure
    bash production/fix_paths.sh

    # Ensure downloads are readable by Nginx container
    chmod -R 755 downloads/

    # Verify APK file exists and size
    echo "🔍 Verify Remote APK:"
    ls -lh downloads/hostshield.apk || echo "❌ APK NOT FOUND ON SERVER"

    # Rebuild and Restart only changed services
    # (Docker caching will make this fast if code hasn't changed much)
    docker compose up -d --build --remove-orphans
    
    # Force recreate web-proxy to pick up new mount if missed
    docker compose up -d --force-recreate --no-deps web-proxy
    
    # 3. Running Database Migrations (Idempotent if written with IF NOT EXISTS)
    echo "🔄 Running database migrations..."
    if [ -d "database/migrations" ]; then
        for sql_file in database/migrations/*.sql; do
            [ -e "$sql_file" ] || continue
            echo "   Executing $sql_file..."
            cat "$sql_file" | docker exec -i hostshield_db_prod psql -U hostshield_user -d hostshield
        done
    fi

    # Prune old images to save disk space
    docker image prune -f
EOF

echo "✅ Deployment Successful!"
