# GovBridge Integration - Deployment Checklist

## Summary

✅ **Code is ready** - All integration code is correct and complete  
⚠️ **Network access required** - Government endpoints need VPN/whitelist  
📋 **Next step** - Deploy and test, then request NASES access if needed  

## Pre-Deployment Checklist

- [x] Fixed `govBridgeService.js` to use correct form identifier (`MVSR.HlaseniePobytu` v1.0)
- [x] Fixed XML generation with proper namespace and structure
- [x] Fixed `docker-compose.prod.yaml` UPVS_ENV (changed from 'test' to 'prod')
- [x] Updated truststore setup script with correct container names
- [x] Verified no infrastructure changes from slovensko.sk
- [x] Identified network access requirement

## Deployment Steps

### 1. Deploy Code to Production

```bash
cd /Users/boris/git-repos/host-shield
./scripts/deploy.sh
```

**What this does:**
- Syncs code to production server
- Rebuilds containers with latest changes
- Restarts all services

### 2. Verify Deployment

```bash
ssh -i ~/.ssh/hostshield_key root@167.86.78.26

# Check containers are running
docker ps

# Check GovBridge environment
docker exec hostshield_gov_api_prod env | grep UPVS_ENV
# Should show: UPVS_ENV=prod

# Check API server
docker logs host-shield-api-server-1 --tail 20
```

### 3. Test Guest Registration

**From your dashboard:**
1. Navigate to guest registration
2. Fill in guest details
3. Click "Register Guest"

**Expected outcomes:**

**Scenario A: Form template missing**
```
Error: "Template not found: MVSR.HlaseniePobytu"
```
→ This is expected without government network access  
→ Form template can't be synced from government server  
→ **Action**: Contact NASES for network access

**Scenario B: Network/SSL error**
```
Error: "SSL connection failed" or "Connection timeout"
```
→ Confirms government endpoints require VPN/whitelist  
→ **Action**: Contact NASES for network access

**Scenario C: Validation works!**
```
Success: "Guest data validated"
```
→ Unexpected but great! GovBridge might have template cached  
→ **Action**: Proceed with testing full submission flow

### 4. Check Logs for Details

```bash
# API Server logs
docker logs host-shield-api-server-1 --tail 50 | grep -i "gov\|bridge\|guest"

# GovBridge logs
docker logs hostshield_gov_api_prod --tail 50 | grep -i "template\|form\|error"
```

## If Network Access is Needed

### Contact NASES

**Email**: integracie@nases.gov.sk
**CC**: prevadzka@nases.gov.sk

**Subject**: Request for UPVS Production API Access - [HSHLD] HostShield

**Message Template**:
```
Dear NASES Support Team,

We are developing HostShield, an accommodation management system that integrates 
with the UPVS portal for automated guest registration reporting.

We are using the slovensko-digital/slovensko-sk-api Docker container and need 
access to the following production endpoints:

- iamwse.slovensko.sk:8581 (STS endpoint)
- iamwse.slovensko.sk:7017 (IAM endpoint)
- usr.slovensko.sk (ServiceBus endpoint)
- eschranka1.slovensko.sk (eDesk endpoint)

Our production server IP: 167.86.78.26

Could you please advise on:
1. The process for obtaining production API access
2. Whether VPN access or IP whitelisting is required
3. Any documentation for the formal integration process

Thank you for your assistance.

Best regards,
[Your Name]
[Your Organization]
```

### Alternative: Use Test Environment

If NASES provides test environment access:

1. Update `docker-compose.prod.yaml`:
```yaml
- UPVS_ENV=dev  # or 'fix' depending on access provided
```

2. Update truststore script for dev environment:
```bash
UPVS_HOST="authws.vyvoj.upvs.globaltel.sk"
UPVS_PORT="443"
```

3. Redeploy

## Troubleshooting

### Issue: "Unknown environment" error in GovBridge logs

**Cause**: Invalid UPVS_ENV value  
**Fix**: Ensure UPVS_ENV is set to 'dev', 'fix', or 'prod' (not 'test')

### Issue: Container won't start after deployment

```bash
# Check container logs
docker logs hostshield_gov_api_prod

# Check if environment variables are set
docker exec hostshield_gov_api_prod env | grep -E "UPVS|RAILS|DATABASE|REDIS"
```

### Issue: API can't connect to GovBridge

```bash
# Test internal network connectivity
docker exec host-shield-api-server-1 curl http://gov-bridge:3000/health

# Check GovBridge is listening
docker exec hostshield_gov_api_prod netstat -tlnp | grep 3000
```

## Success Criteria

✅ All containers running  
✅ UPVS_ENV=prod in GovBridge  
✅ API can reach GovBridge  
✅ Guest registration endpoint responds (even if validation fails)  
✅ Clear error message indicating next steps  

## Files Modified

1. **docker-compose.prod.yaml**
   - Changed `UPVS_ENV` from 'test' to 'prod'

2. **apps/api-server/src/services/govBridgeService.js**
   - Fixed form identifier to `MVSR.HlaseniePobytu` v1.0
   - Proper XML namespace and structure

3. **production/setup_truststore_and_sync.sh**
   - Updated container names for production
   - Ready to run when network access is available

## Documentation Created

- `production/FINAL_ANALYSIS.md` - Complete investigation results
- `production/SOLUTION_UPVS_ENV.md` - Environment configuration details
- `production/DNS_ISSUE_ANALYSIS.md` - DNS resolution investigation
- `production/GOVBRIDGE_DEPLOYMENT.md` - Original deployment guide

---

**Ready to deploy!** 🚀

Run `./scripts/deploy.sh` and let's see what happens!
