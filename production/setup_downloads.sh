#!/bin/bash

# Setup Downloads Directory for APK Hosting

PROJECT_ROOT=$(pwd)
DOWNLOADS_DIR="$PROJECT_ROOT/downloads"

echo "Setup Downloads Directory..."

# 1. Create directory if not exists
if [ ! -d "$DOWNLOADS_DIR" ]; then
    mkdir -p "$DOWNLOADS_DIR"
    echo "Created downloads directory at: $DOWNLOADS_DIR"
else
    echo "Downloads directory already exists."
fi

# 2. Check for APK file
APK_FILE="$DOWNLOADS_DIR/hostshield.apk"
if [ ! -f "$APK_FILE" ]; then
    echo "WARNING: hostshield.apk not found in $DOWNLOADS_DIR"
    echo "Please copy your built APK file to this location:"
    echo "  cp /path/to/your/app.apk $APK_FILE"
else
    echo "APK file found."
fi

# 3. Instruction to restart proxy
echo ""
echo "Configuration complete. To apply changes:"
echo "1. Ensure you have rebuilt the web-client if needed (though this is a volume mount, so config change might need restart)"
echo "2. Restart the web-proxy service (if not running deploy.sh):"
echo "   docker compose up -d --no-deps web-proxy"
echo ""
echo "Your APK will be available at: https://hostshield.org/downloads/hostshield.apk"
