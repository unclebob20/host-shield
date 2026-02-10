# GovBridge Integration - Production Deployment Guide

## Current Status (Feb 10, 2026)

The maintenance window for slovensko.sk has closed. The integration code is ready for production deployment.

## What's Been Fixed

### 1. **Correct Form Identifier** ✅
- Changed from `App.GeneralAgenda` (v1.9) to `MVSR.HlaseniePobytu` (v1.0)
- Updated in `govBridgeService.js` line 186

### 2. **XML Payload Generation** ✅
- Generates proper XML structure with correct namespace
- Includes XML declaration: `<?xml version="1.0" encoding="UTF-8"?>`
- Properly formats dates as YYYY-MM-DD

### 3. **Multi-Tenant Credential System** ✅
- JKS keystore generation working
- Password derivation from ICO working
- JWT signing with RS256 working
- Credentials stored in `/security/hosts/<ico>/`

### 4. **Clean Service Code** ✅
- Removed temporary auto-sync logic that was failing
- Proper error handling and logging
- Ready for production use

## What Needs to Be Done on Production Server

### Step 1: Deploy Code
```bash
cd /Users/boris/git-repos/host-shield
./scripts/deploy.sh
```

This will:
- Sync all code changes to production server (167.86.78.26)
- Rebuild containers with latest code
- Restart all services

### Step 2: Run Truststore Setup Script

**SSH into production server:**
```bash
ssh -i ~/.ssh/hostshield_key root@167.86.78.26
```

**Run the setup script:**
```bash
cd /root/host-shield
chmod +x production/setup_truststore_and_sync.sh
./production/setup_truststore_and_sync.sh
```

**What this script does:**
1. ✅ Checks connectivity to `iamwse.slovensko.sk`
2. 🔐 Fetches SSL certificate from government server
3. 📦 Creates `upvs_prod.truststore` with the certificate
4. 📁 Saves truststore to `/opt/hostshield/security/tls/`
5. 🔄 Restarts GovBridge container to load truststore
6. 📥 Downloads `MVSR.HlaseniePobytu` form template (v1.0)

### Step 3: Verify Form Template Loaded

**Check GovBridge logs:**
```bash
docker logs hostshield_gov_api_prod --tail 50
```

**Look for:**
- ✅ "Form template downloaded successfully"
- ✅ No SSL/certificate errors
- ✅ No "Template not found" errors

### Step 4: Test Guest Registration

**From your dashboard:**
1. Click "Register Guest" button
2. Fill in guest details
3. Submit

**Expected result:**
- ✅ Validation succeeds
- ✅ No "Invalid form" error
- ✅ No "Template not found" error

**Check API logs if needed:**
```bash
docker logs host-shield-api-server-1 --tail 50
```

## Troubleshooting

### Issue: DNS Still Failing for iamwse.slovensko.sk

**Check if maintenance is truly over:**
```bash
curl -v https://iamwse.slovensko.sk:8581
```

**If DNS fails but you know the IP:**
```bash
# Add to /etc/hosts on production server
echo "XXX.XXX.XXX.XXX iamwse.slovensko.sk" >> /etc/hosts
```

### Issue: Certificate Fetch Fails

**Manual certificate fetch:**
```bash
echo -n | openssl s_client -connect iamwse.slovensko.sk:8581 -showcerts
```

**If port 8581 doesn't work, try standard HTTPS:**
```bash
echo -n | openssl s_client -connect iamwse.slovensko.sk:443 -showcerts
```

### Issue: Form Sync Fails with Auth Error

**Check GovBridge API token:**
```bash
docker exec hostshield_gov_api_prod env | grep API_TOKEN
```

**Manually trigger sync with correct subject:**
```bash
docker exec -e EFORM_SYNC_SUBJECT=56051026 hostshield_gov_api_prod \
  /app/bin/rails runner 'DownloadFormTemplateJob.perform_now("MVSR.HlaseniePobytu", 1, 0)'
```

### Issue: Truststore Not Loading

**Check if truststore file exists:**
```bash
ls -lh /opt/hostshield/security/tls/upvs_prod.truststore
```

**Check GovBridge volume mounts:**
```bash
docker inspect hostshield_gov_api_prod | grep -A 10 Mounts
```

**You may need to add truststore volume to docker-compose.prod.yaml:**
```yaml
gov-bridge:
  volumes:
    - /opt/hostshield/security/tls/upvs_prod.truststore:/app/security/upvs_prod.truststore:ro
```

## Files Changed in This Update

1. **apps/api-server/src/services/govBridgeService.js**
   - Fixed form identifier to `MVSR.HlaseniePobytu` v1.0
   - Cleaned up auto-sync logic
   - Proper XML generation with namespace

2. **production/setup_truststore_and_sync.sh**
   - Fixed container names for production
   - Added comprehensive error checking
   - Automated form template download

## Next Steps After Successful Deployment

1. **Test with Real Host Credentials**
   - Generate JKS keystore for a real host (with valid ICO)
   - Test end-to-end submission

2. **Monitor Production Logs**
   - Watch for any SSL/certificate errors
   - Monitor form validation responses

3. **Update Documentation**
   - Document the working flow
   - Create troubleshooting guide for common issues

## Important Notes

⚠️ **Local Testing Not Possible**: The GovBridge container is x86-based and won't run properly on macOS ARM architecture. All testing must be done on the production server.

⚠️ **Government Service Dependency**: The form template sync requires the government server to be online and accessible. If maintenance windows occur, the sync will fail.

⚠️ **Certificate Expiry**: The SSL certificate fetched from the government server will expire. You may need to re-run the truststore setup script periodically (check certificate validity with `keytool -list -keystore upvs_prod.truststore`).

## Success Criteria

✅ Script runs without errors  
✅ Truststore file created at `/opt/hostshield/security/tls/upvs_prod.truststore`  
✅ GovBridge restarts successfully  
✅ Form template `MVSR.HlaseniePobytu` v1.0 downloaded  
✅ Guest registration validates successfully  
✅ No "Invalid form" or "Template not found" errors  

---

**Last Updated**: Feb 10, 2026  
**Status**: Ready for Production Deployment
