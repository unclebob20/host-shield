# SOLUTION FOUND: GovBridge Environment Configuration

## Root Cause Identified

1. **Invalid UPVS_ENV**: Our `docker-compose.prod.yaml` sets `UPVS_ENV=test`, but the GovBridge only supports:
   - `dev` - Development environment (vyvoj.upvs.globaltel.sk)
   - `fix` - Testing/Fix environment (upvsfixnew.gov.sk)
   - `prod` - Production environment (slovensko.sk)

2. **DNS Issue Explained**: The `iamwse.slovensko.sk` hostname **DOES exist** and is the correct production endpoint, but it may be:
   - Blocked by firewall/network
   - Requires special network access
   - Currently experiencing issues

## Correct Endpoints by Environment

### DEV Environment (`UPVS_ENV=dev`)
```
upvs.eks.address: https://edeskii.vyvoj.upvs.globaltel.sk/EKSService.svc
upvs.ez.address: https://vyvoj.upvs.globaltel.sk/ServiceBus/ServiceBusToken.svc
upvs.iam.address: https://authws.vyvoj.upvs.globaltel.sk/iamws17/GetIdentityService
upvs.sktalk.address: https://vyvoj.upvs.globaltel.sk/g2g/G2GServiceBus/ServiceSkTalk3Token.svc
upvs.sts.address: https://authws.vyvoj.upvs.globaltel.sk/sts/wss11x509
```

### FIX Environment (`UPVS_ENV=fix`)
```
upvs.eks.address: https://eschranka.upvsfixnew.gov.sk/EKSService.svc
upvs.ez.address: https://usr.upvsfixnew.gov.sk/ServiceBus/ServiceBusToken.svc
upvs.iam.address: https://iamwse.upvsfix.gov.sk:7017/iamws17/GetIdentityService
upvs.sktalk.address: https://uir.upvsfixnew.gov.sk/G2GServiceBus/ServiceSkTalk3Token.svc
upvs.sts.address: https://iamwse.upvsfix.gov.sk:8581/sts/wss11x509
```

### PROD Environment (`UPVS_ENV=prod`)
```
upvs.eks.address: https://eschranka1.slovensko.sk/EKSService.svc
upvs.ez.address: https://usr.slovensko.sk/ServiceBus/ServiceBusToken.svc
upvs.iam.address: https://iamwse.slovensko.sk:7017/iamws17/GetIdentityService
upvs.sktalk.address: https://uir.slovensko.sk/G2GServiceBus/ServiceSkTalk3Token.svc
upvs.sts.address: https://iamwse.slovensko.sk:8581/sts/wss11x509
```

## Truststore File Path

The GovBridge expects the truststore at:
```
/app/security/tls/upvs_{env}.truststore
```

For example:
- `upvs_dev.truststore` for dev
- `upvs_fix.truststore` for fix  
- `upvs_prod.truststore` for prod

## Immediate Fix Required

### 1. Update docker-compose.prod.yaml

Change `UPVS_ENV` from `test` to one of the valid environments. For initial testing, use `dev`:

```yaml
gov-bridge:
  environment:
    - UPVS_ENV=dev  # Changed from 'test' to 'dev'
```

### 2. Update Truststore Setup Script

The script needs to:
- Use the correct hostname for the chosen environment
- Create the truststore with the correct filename

For `dev` environment:
```bash
UPVS_HOST="authws.vyvoj.upvs.globaltel.sk"
UPVS_PORT="443"  # Standard HTTPS port
TRUSTSTORE_NAME="upvs_dev.truststore"
```

For `fix` environment:
```bash
UPVS_HOST="iamwse.upvsfix.gov.sk"
UPVS_PORT="8581"
TRUSTSTORE_NAME="upvs_fix.truststore"
```

For `prod` environment (if accessible):
```bash
UPVS_HOST="iamwse.slovensko.sk"
UPVS_PORT="8581"
TRUSTSTORE_NAME="upvs_prod.truststore"
```

## Recommended Approach

**Start with DEV environment** since it's most likely to be accessible:

1. Update `docker-compose.prod.yaml` to use `UPVS_ENV=dev`
2. Create truststore for dev environment
3. Test the integration
4. Once working, move to `fix` or `prod` as needed

## Testing DNS Connectivity

Before running the truststore script, test each environment's connectivity:

```bash
# Test DEV
nslookup authws.vyvoj.upvs.globaltel.sk
curl -v https://authws.vyvoj.upvs.globaltel.sk 2>&1 | head -20

# Test FIX
nslookup iamwse.upvsfix.gov.sk
curl -v https://iamwse.upvsfix.gov.sk:8581 2>&1 | head -20

# Test PROD
nslookup iamwse.slovensko.sk
curl -v https://iamwse.slovensko.sk:8581 2>&1 | head -20
```

## Next Steps

1. **Test connectivity** to each environment from production server
2. **Choose the accessible environment** (likely `dev`)
3. **Update docker-compose.prod.yaml** with correct `UPVS_ENV`
4. **Update truststore script** for the chosen environment
5. **Deploy and test**

---

**Status**: Solution identified - need to use valid UPVS_ENV value  
**Recommended**: Start with `UPVS_ENV=dev`  
**Date**: Feb 10, 2026
