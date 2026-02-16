# Stripe Payment Integration Setup Guide

## Problem
When clicking "Subscribe Now" button, you get "Failed to start checkout process" error because:
1. ✅ Stripe integration code exists in the backend
2. ❌ Stripe API keys are not configured
3. ❌ Environment variables were not being passed to the container (NOW FIXED)

## What I Fixed
- ✅ Added Stripe environment variables to `compose.yaml` (local dev)
- ✅ Fixed duplicate variable in `production/docker-compose.prod.yaml`

## What You Need to Do

### Step 1: Get Your Stripe API Keys

1. **Sign up/Login to Stripe**: https://dashboard.stripe.com/
2. **Get your API keys**:
   - Go to: Developers → API keys
   - Copy your **Secret key** (starts with `sk_test_...` for test mode)
   - Copy your **Publishable key** (starts with `pk_test_...` for test mode)

### Step 2: Create Stripe Products & Prices

You need to create two subscription products in Stripe:

#### Professional Plan (€15/month)
1. Go to: Products → Add Product
2. Name: `HostShield Professional`
3. Price: €15.00 EUR
4. Billing period: Monthly
5. **Copy the Price ID** (starts with `price_...`)

#### Business Plan (€49/month)
1. Go to: Products → Add Product
2. Name: `HostShield Business`
3. Price: €49.00 EUR
4. Billing period: Monthly
5. **Copy the Price ID** (starts with `price_...`)

### Step 3: Update Environment Variables

#### On VPS (Production)
SSH into your VPS and edit the `.env` file:

```bash
ssh -i ~/.ssh/hostshield_key root@167.86.78.26
cd /opt/hostshield
nano .env
```

Update these lines:
```bash
# --- Payment (Stripe) ---
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
CLIENT_URL=https://hostshield.org
```

#### In Local Repository
Update `/Users/boris/git-repos/host-shield/.env`:
```bash
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
CLIENT_URL=https://hostshield.org
```

### Step 4: Update Frontend Price IDs

Edit: `apps/web-client/src/components/SubscriptionManagement.jsx`

Replace lines 15-18 with your actual Stripe Price IDs:
```javascript
const STRIPE_PRICE_IDS = {
    professional: 'price_YOUR_PROFESSIONAL_PLAN_ID', // €15/month
    business: 'price_YOUR_BUSINESS_PLAN_ID'          // €49/month
};
```

### Step 5: Setup Stripe Webhook (Important!)

1. **Go to**: Stripe Dashboard → Developers → Webhooks
2. **Click**: Add endpoint
3. **Endpoint URL**: `https://hostshield.org/api/payments/webhook`
4. **Select events to listen to**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
5. **Copy the Webhook Secret** (starts with `whsec_...`)
6. **Update** your `.env` file with this webhook secret

### Step 6: Deploy

After making all the changes above:

```bash
# From your local repository
./deploy.sh
```

This will:
1. Sync your code changes to VPS
2. Rebuild containers with new environment variables
3. Restart the services

### Step 7: Test the Integration

1. Go to: `https://hostshield.org/settings` (Subscription tab)
2. Click "Subscribe Now" on Professional plan
3. You should be redirected to Stripe Checkout
4. Use Stripe test card: `4242 4242 4242 4242`
5. After payment, you should be redirected back with success message

## Test Mode vs Live Mode

**Currently using TEST mode** (recommended for initial setup):
- Use `sk_test_...` keys
- Use test card numbers
- No real charges

**When ready for production**:
1. Switch to Live mode in Stripe Dashboard
2. Replace `sk_test_...` with `sk_live_...`
3. Update webhook endpoint for live mode
4. Redeploy

## Troubleshooting

### Check if Stripe keys are loaded:
```bash
ssh -i ~/.ssh/hostshield_key root@167.86.78.26
docker exec hostshield_api_prod printenv | grep STRIPE
```

### Check API logs:
```bash
docker logs hostshield_api_prod --tail 100
```

### Common Issues:
- **"No checkout URL received"**: Stripe keys are invalid or not set
- **"Webhook signature verification failed"**: Webhook secret is wrong
- **Redirect to wrong URL**: Check `CLIENT_URL` in `.env`

## Security Notes

⚠️ **NEVER commit your actual Stripe keys to git!**
- The `.env` file is in `.gitignore`
- Only `.env.example` should be in git with placeholder values
- Keep production keys secure on VPS only

## Next Steps (Optional)

1. **Encrypt Stripe Keys**: Use the same encryption as gov credentials
2. **Add Stripe Customer Portal**: Let users manage subscriptions
3. **Add Usage Tracking**: Monitor API usage per subscription tier
4. **Add Trial Period**: Offer 14-day free trial
