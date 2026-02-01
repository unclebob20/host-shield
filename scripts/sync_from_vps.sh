#!/bin/bash
# Safe sync script from VPS to local
# This script syncs from remote to local while protecting critical local files

set -e

LOCAL_DIR="/Users/boris/git-repos/host-shield"
REMOTE_HOST="root@167.86.78.26"
REMOTE_DIR="/root/host-shield"
SSH_KEY="/Users/boris/.ssh/hostshield_key"

echo "🔄 Safe Sync from VPS to Local"
echo "================================"
echo ""
echo "Local:  $LOCAL_DIR"
echo "Remote: $REMOTE_HOST:$REMOTE_DIR"
echo ""

# Step 1: Dry-run to see what would change
echo "📋 Step 1: Dry-run (preview changes)..."
echo "----------------------------------------"
rsync -avzn --progress \
  --exclude='.git' \
  --exclude='.git/' \
  --exclude='.env.production' \
  --exclude='.DS_Store' \
  --exclude='node_modules/' \
  --exclude='.venv/' \
  --exclude='*.tar.gz' \
  -e "ssh -i $SSH_KEY" \
  "$REMOTE_HOST:$REMOTE_DIR/" \
  "$LOCAL_DIR/"

echo ""
echo "----------------------------------------"
read -p "🤔 Do you want to proceed with the actual sync? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "✅ Proceeding with sync..."
    echo ""
    
    # Step 2: Actual sync
    rsync -avz --progress \
      --exclude='.git' \
      --exclude='.git/' \
      --exclude='.env.production' \
      --exclude='.DS_Store' \
      --exclude='node_modules/' \
      --exclude='.venv/' \
      --exclude='*.tar.gz' \
      -e "ssh -i $SSH_KEY" \
      "$REMOTE_HOST:$REMOTE_DIR/" \
      "$LOCAL_DIR/"
    
    echo ""
    echo "✅ Sync completed successfully!"
    echo ""
    
    # Step 3: Show git status
    echo "📊 Git status after sync:"
    echo "----------------------------------------"
    cd "$LOCAL_DIR"
    git status --short
    
else
    echo ""
    echo "❌ Sync cancelled."
fi

echo ""
echo "✨ Done!"
