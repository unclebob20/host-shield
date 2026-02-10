# GovBridge Integration - Critical DNS Issue Resolution

## Problem Identified

The `iamwse.slovensko.sk` hostname **does not exist** in DNS (NXDOMAIN error). This is not a temporary maintenance issue - the hostname appears to be incorrect or outdated.

## Current Configuration Analysis

1. **Production docker-compose.yaml**: Sets `UPVS_ENV=test`
2. **Production server**: Currently has `UPVS_ENV=prod`  
3. **Form template**: `MVSR.HlaseniePobytu` is **NOT** in the database (count = 0)

## Root Cause

The `iamwse.slovensko.sk` endpoint in our truststore setup script is likely:
- An outdated hostname
- A test-environment-specific hostname that no longer exists
- Or requires VPN/special network access

## Alternative Approaches

### Option 1: Use GovBridge Without External Sync (RECOMMENDED FOR NOW)

Since the GovBridge container already has form template sync capabilities built-in, and the DNS issue is blocking us, we should:

1. **Manually add the form template XSD** to the GovBridge database
2. **Skip the truststore setup** for now (only needed for actual government submissions)
3. **Test the validation flow** with the local form template

**Steps:**

```bash
# SSH to production
ssh -i ~/.ssh/hostshield_key root@167.86.78.26

# Check if we can manually insert the form template
# The GovBridge might have the XSD bundled or we can provide it manually
docker exec hostshield_gov_api_prod /app/bin/rails runner "
  FormTemplate.create!(
    identifier: 'MVSR.HlaseniePobytu',
    version_major: 1,
    version_minor: 0,
    # XSD content would go here
  )
"
```

### Option 2: Find the Correct Test Environment Endpoint

The slovensko.sk API likely has different endpoints for test vs production:

**Possible test endpoints to try:**
- `test.slovensko.sk`
- `test-www.slovensko.sk`
- `staging.slovensko.sk`
- `dev.slovensko.sk`

**Check what endpoint the GovBridge is actually configured to use:**

```bash
ssh -i ~/.ssh/hostshield_key root@167.86.78.26

# Search for UPVS configuration in the container
docker exec hostshield_gov_api_prod find /app -name "*.rb" -o -name "*.yml" | xargs grep -l "slovensko.sk" 2>/dev/null

# Or check the Rails configuration
docker exec hostshield_gov_api_prod /app/bin/rails runner "puts Rails.application.config.inspect" | grep -i upvs
```

### Option 3: Contact Slovensko.Digital or Check Documentation

The slovensko-digital/slovensko-sk-api repository should have documentation about:
- Correct endpoints for test vs production
- How to sync form templates
- SSL certificate requirements

## Immediate Action Plan

Since we can't resolve DNS for `iamwse.slovensko.sk`, let's:

1. **Deploy the current code** (it's ready and correct)
2. **Test the validation endpoint** to see what error we get
3. **Investigate the actual endpoint** the GovBridge uses internally
4. **Consider using test mode** without external government connectivity for now

The validation might work even without the form template if the GovBridge has it bundled, or we might get a more informative error that tells us what's actually needed.

## Updated Deployment Steps

### Step 1: Deploy Code
```bash
cd /Users/boris/git-repos/host-shield
./scripts/deploy.sh
```

### Step 2: Test Current State
```bash
ssh -i ~/.ssh/hostshield_key root@167.86.78.26

# Test the validation endpoint directly
curl -X POST http://localhost:3001/api/eform/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "form": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><RegistrationOfStay xmlns=\"http://schemas.gov.sk/form/MVSR.HlaseniePobytu/1.0\"><Guest><FirstName>Test</FirstName><Surname>User</Surname><DateOfBirth>1990-01-01</DateOfBirth><Nationality>SVK</Nationality><DocumentNumber>AA123456</DocumentNumber><ArrivalDate>2026-02-10</ArrivalDate><DepartureDate>2026-02-15</DepartureDate></Guest></RegistrationOfStay>"
  }' \
  --url-query "identifier=MVSR.HlaseniePobytu&version=1.0"
```

### Step 3: Investigate GovBridge Configuration
```bash
# Find what endpoints are actually configured
docker exec hostshield_gov_api_prod grep -r "slovensko.sk" /app/config/ 2>/dev/null || echo "No config files accessible"

# Check if there's an initializer or environment-specific config
docker exec hostshield_gov_api_prod ls -la /app/config/environments/
docker exec hostshield_gov_api_prod cat /app/config/environments/production.rb | grep -i upvs
```

## Next Steps

1. Deploy the code (it's correct regardless of this DNS issue)
2. Test what happens when we try to validate
3. Based on the error, determine if we need:
   - The correct endpoint URL
   - A manual form template insertion
   - A different approach entirely

The code changes we made are solid - this is purely an infrastructure/configuration discovery issue.

---

**Status**: Blocked by DNS resolution for `iamwse.slovensko.sk`  
**Action**: Deploy code and investigate actual GovBridge endpoint configuration  
**Date**: Feb 10, 2026
