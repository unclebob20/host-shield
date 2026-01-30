#!/bin/bash
set -e

# 1. Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    apt-get update
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# 2. Setup Directory
mkdir -p /opt/hostshield
cd /opt/hostshield

# 3. Nginx Setup
mkdir -p nginx

# 4. Check if we need to start
if [ -f "docker-compose.yml" ]; then
    echo "Deploying HostShield..."
    docker compose up -d --build
    echo "Done! Server running on port 80/443."
else
    echo "Setup complete. Upload your files to /opt/hostshield and run 'docker compose up -d --build'"
fi
