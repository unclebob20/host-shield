#!/bin/bash
# Secure Deploy Script - Deploys only necessary files, NOT .git
# This script syncs code to VPS while excluding sensitive files

set -e

echo "� Secure Deployment to VPS"
echo "============================"
echo ""

LOCAL_DIR="/Users/boris/git-repos/host-shield"
REMOTE_HOST="root@167.86.78.26"
REMOTE_DIR="/root/host-shield"
SSH_KEY="/Users/boris/.ssh/hostshield_key"

# Step 1: Check for uncommitted changes
echo "📋 Step 1: Checking git status..."
cd "$LOCAL_DIR"

if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Commit these changes first? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " COMMIT_MSG
        git add .
        git commit -m "$COMMIT_MSG"
        git push origin main
        echo "✅ Changes committed and pushed to GitHub"
    else
        echo "⚠️  Proceeding with uncommitted changes..."
    fi
fi

echo ""
echo "📊 Current commit: $(git log -1 --oneline)"
echo ""

# Step 2: Sync files to VPS (excluding sensitive files)
echo "� Step 2: Syncing files to VPS..."
echo "-----------------------------------"

rsync -avz --progress \
  --exclude='.git/' \
  --exclude='.git' \
  --exclude='.gitignore' \
  --exclude='.env.production' \
  --exclude='.env.local' \
  --exclude='.DS_Store' \
  --exclude='node_modules/' \
  --exclude='.venv/' \
  --exclude='*.tar.gz' \
  --exclude='samples/' \
  --exclude='.vscode/' \
  --exclude='.idea/' \
  --exclude='README.md' \
  --exclude='docs/' \
  --exclude='.env.example' \
  -e "ssh -i $SSH_KEY" \
  "$LOCAL_DIR/" \
  "$REMOTE_HOST:$REMOTE_DIR/"

echo ""
echo "✅ Files synced successfully"
echo ""

# Step 3: Rebuild and restart containers
echo "� Step 3: Rebuilding containers on VPS..."
echo "-------------------------------------------"

ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'ENDSSH'
    set -e
    cd /root/host-shield
    
    echo "� Stopping containers..."
    docker compose -f docker-compose.prod.yaml down
    
    echo "🏗️  Building new images..."
    docker compose -f docker-compose.prod.yaml build --no-cache
    
    echo "🚀 Starting containers..."
    docker compose -f docker-compose.prod.yaml up -d
    
    echo "⏳ Waiting for services to start..."
    sleep 5
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📊 Container status:"
    docker compose -f docker-compose.prod.yaml ps
ENDSSH

echo ""
echo "✅ Deployment successful!"
echo ""
echo "🌐 Your app should be live at: http://167.86.78.26"
echo ""
echo "📋 What was deployed:"
echo "  - Application code (apps/)"
echo "  - Database schemas (database/)"
echo "  - Docker configs (production/, compose files)"
echo "  - Security files (security/)"
echo ""
echo "🔒 What was NOT deployed (security):"
echo "  - .git directory (source control)"
echo "  - .env.production (local secrets)"
echo "  - docs/ (documentation)"
echo "  - samples/ (test data)"
echo ""
