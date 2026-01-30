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
echo "🔄 Syncing code..."
rsync -avz -e "ssh -i $SSH_KEY" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude '.env' \
  apps production database \
  $SERVER_USER@$SERVER_IP:$REMOTE_DIR/

# 2. Remote Build & Restart
echo "🏗️  Building and Restarting Containers..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP << 'EOF'
    cd /opt/hostshield

    # Refresh docker-compose.yml from the uploaded production version
    cp production/docker-compose.prod.yaml docker-compose.yml
    
    # Reload Nginx Config (if changed in production/nginx)
    cp production/nginx/nginx.conf nginx/nginx.conf

    # Apply Path Fixes for VPS Structure
    bash fix_paths.sh

    # Rebuild and Restart only changed services
    # (Docker caching will make this fast if code hasn't changed much)
    docker compose up -d --build --remove-orphans
    
    # Prune old images to save disk space
    docker image prune -f
EOF

echo "✅ Deployment Successful!"
