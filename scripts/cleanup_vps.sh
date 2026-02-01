#!/bin/bash
# VPS Cleanup Script - Remove old/duplicate deployment directories
# This script safely removes the old /opt/hostshield directory
# and ensures /root/host-shield is the single source of truth

set -e

echo "🔍 VPS Directory Cleanup Script"
echo "================================"
echo ""

# Check if /opt/hostshield exists
if [ -d "/opt/hostshield" ]; then
    echo "📦 Found old directory: /opt/hostshield"
    echo "   Last modified: $(stat -c %y /opt/hostshield 2>/dev/null || stat -f %Sm /opt/hostshield)"
    echo ""
    
    # Create backup just in case
    echo "💾 Creating backup..."
    tar -czf /root/hostshield_opt_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /opt hostshield
    echo "   ✅ Backup created in /root/"
    echo ""
    
    # Remove the old directory
    echo "🗑️  Removing /opt/hostshield..."
    rm -rf /opt/hostshield
    echo "   ✅ Removed successfully"
    echo ""
else
    echo "✅ /opt/hostshield does not exist (already clean)"
    echo ""
fi

# Also check for /opt/hostshield_setup
if [ -d "/opt/hostshield_setup" ]; then
    echo "🗑️  Removing /opt/hostshield_setup..."
    rm -rf /opt/hostshield_setup
    echo "   ✅ Removed successfully"
    echo ""
fi

echo "✨ Cleanup complete!"
echo ""
echo "📍 Active deployment directory: /root/host-shield"
echo "🐳 Running containers:"
docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -i host
echo ""
echo "✅ VPS is now normalized with single deployment directory"
