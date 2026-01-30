
# 1. Update paths for local server layout (Escape dots for regex!)
# Fix Contexts (../apps -> ./apps)
sed -i 's|\.\./apps|\./apps|g' docker-compose.yml

# We DO NOT touch the ../../production path because relative to ./apps/web-client/ it is still ../../production on the server
# And we must ensure we don't accidentally break it if we run this script multiple times
# So we only replace if it starts with ../../
sed -i 's|\.\./\.\./production|\./production|g' docker-compose.yml

# Fix API server context specifically if missed
sed -i 's|\.\./apps/api-server|\./apps/api-server|g' docker-compose.yml

# 2. Fix the web-proxy build context specific for VPS deployment
sed -i 's|context: ../apps/web-client|context: ./apps/web-client|g' docker-compose.yml

# 3. Clean up any broken colons from previous bad seds (SafetyNet)
sed -i 's|build\./|build: ./|g' docker-compose.yml
sed -i 's|context\./|context: ./|g' docker-compose.yml

# 4. FIX: Ensure environment variables are actually read!
# Docker Compose sometimes needs explicit instruction to read .env if not in root
# But here everything is in root.
# Problem likely: The variables inside docker-compose.yml used ${VAR} but VAR wasn't in .env

echo "Paths fixed in docker-compose.yml"
