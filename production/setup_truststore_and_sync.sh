#!/bin/bash

# Configuration
BRIDGE_CONTAINER="hostshield_gov_api_prod"
# API server container name from production (verified with docker ps)
API_SERVER_CONTAINER="hostshield-api-server-1"
TRUSTSTORE_HOST_PATH="/opt/hostshield/security/tls/upvs_prod.truststore"
UPVS_HOST="iamwse.slovensko.sk" # Use this if DNS works, or correct host if changed
UPVS_PORT="8581"

echo "=== HostShield GovBridge Setup ==="
echo "Checking connectivity to ${UPVS_HOST}..."

# 1. Check Connectivity
ping -c 1 $UPVS_HOST > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Cannot ping ${UPVS_HOST}. The government service is unreachable or DNS is failing."
    echo "⚠️  NOTE: Check if slovensko.sk is under maintenance."
    exit 1
fi

echo "✅ Connectivity OK."

# 2. Fetch Certificate & Create Truststore inside API Server (has OpenSSL & Keytool)
echo "Generating Truststore..."
docker exec $API_SERVER_CONTAINER bash -c "echo -n | openssl s_client -connect ${UPVS_HOST}:${UPVS_PORT} -showcerts | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > /tmp/upvs.crt"
if [ $? -ne 0 ]; then
    echo "❌ Failed to fetch certificate from ${UPVS_HOST}."
    exit 1
fi

docker exec $API_SERVER_CONTAINER bash -c "keytool -import -trustcacerts -file /tmp/upvs.crt -alias upvs_prod -keystore /tmp/upvs_prod.truststore -storepass password -noprompt"
if [ $? -ne 0 ]; then
    echo "❌ Failed to create keystore."
    exit 1
fi

# 3. Copy Truststore to Host
echo "Copying truststore to host..."
mkdir -p /opt/hostshield/security/tls
docker cp $API_SERVER_CONTAINER:/tmp/upvs_prod.truststore $TRUSTSTORE_HOST_PATH

# 4. Restart Bridge to pick up Truststore
echo "Restarting GovBridge..."
docker restart $BRIDGE_CONTAINER
sleep 15

# 5. Sync Forms
echo "Synchronizing Form Templates (MVSR.HlaseniePobytu)..."
# We specifically request the Hlasenie Pobytu form
# Assuming EFORM_SYNC_SUBJECT is set in env or we pass it
# We need a valid Subject ID (e.g. 56051026) to run this job.
# The user should replace <SUBJECT_ID> if needed.
SUBJECT_ID="56051026" 

docker exec -e EFORM_SYNC_SUBJECT=$SUBJECT_ID $BRIDGE_CONTAINER /app/bin/rails runner 'DownloadFormTemplateJob.perform_now("MVSR.HlaseniePobytu", 1, 0)'

if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: Form templates synchronized."
else
    echo "❌ ERROR: Form synchronization failed. Check logs."
fi
