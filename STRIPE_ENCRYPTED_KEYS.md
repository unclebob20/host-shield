# Stripe Integration - Encrypted Keys Setup

## Current Status
✅ Code now properly handles **encrypted** Stripe keys
✅ Authentication issue fixed (req.authenticatedHost)
✅ Webhook handler updated to decrypt keys

## Your Stripe Keys Are Encrypted

Since you mentioned your Stripe key is encrypted, you need to:

### 1. Encrypt Your Stripe Secret Key

Use the same encryption script you use for other credentials:

```bash
# On your local machine
cd /Users/boris/git-repos/host-shield
node scripts/encrypt_stripe.js
```

This will prompt you for:
- Your real Stripe secret key (starts with `sk_test_` or `sk_live_`)
- Your real Stripe webhook secret (starts with `whsec_`)

It will output encrypted versions like:
```
enc:abc123...:def456...:789xyz...
```

### 2. Update .env on VPS

SSH into your VPS and update the `.env` file:

```bash
ssh -i ~/.ssh/hostshield_key root@167.86.78.26
cd /opt/hostshield
nano .env
```

Replace these lines with the encrypted output:
```bash
STRIPE_SECRET_KEY=enc:iv_here:authTag_here:encrypted_data_here
STRIPE_WEBHOOK_SECRET=enc:iv_here:authTag_here:encrypted_data_here
```

### 3. Verify Encryption Key Exists

Make sure `CREDENTIAL_ENCRYPTION_KEY` is set in your `.env` file (it should already be there from line 16 of your local .env).

### 4. Deploy

```bash
./deploy.sh
```

## If You Want to Use Unencrypted Keys (Simpler for Testing)

If you want to test without encryption first:

1. Get your real Stripe keys from https://dashboard.stripe.com/test/apikeys
2. Update `.env` on VPS with the **plain** keys:
   ```bash
   STRIPE_SECRET_KEY=sk_test_YOUR_REAL_KEY_HERE
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_REAL_WEBHOOK_SECRET_HERE
   ```
3. Deploy with `./deploy.sh`

The code now handles both encrypted (`enc:...`) and plain keys automatically!

## What Was Fixed

1. **paymentController.js** - Now properly decrypts encrypted Stripe keys before use
2. **paymentService.js** - Added trim() and validation to prevent whitespace issues
3. Both files now share the same decryption logic

## Next Steps

1. ✅ Encrypt your Stripe keys (or use plain for testing)
2. ✅ Update `.env` on VPS
3. ✅ Deploy with `./deploy.sh`
4. ✅ Test the checkout flow
5. ⏳ Set up webhook in Stripe Dashboard (see STRIPE_SETUP.md)

## Testing

After deployment, the error should be gone and you should see:
- Successful redirect to Stripe Checkout
- No "Invalid character" errors in logs
- Proper subscription activation after payment
