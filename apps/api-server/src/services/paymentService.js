const encryptionService = require('./encryptionService');
const { query } = require('../services/db');
let stripe;

// Helper to decrypt config if needed
function getStripeKey() {
    const rawKey = process.env.STRIPE_SECRET_KEY;
    if (!rawKey) return null;

    // Trim whitespace that might cause issues
    const trimmedKey = rawKey.trim();

    if (trimmedKey.startsWith('enc:')) {
        try {
            // Format: enc:iv:authTag:encryptedData
            const parts = trimmedKey.split(':');
            if (parts.length !== 4) return trimmedKey;

            const iv = parts[1];
            const authTag = parts[2];
            const encryptedHex = parts[3];

            const decrypted = encryptionService.decrypt(
                Buffer.from(encryptedHex, 'hex'),
                Buffer.from(iv, 'hex'),
                Buffer.from(authTag, 'hex')
            );
            return decrypted.toString('utf8').trim();
        } catch (e) {
            console.error('Failed to decrypt STRIPE_SECRET_KEY:', e);
            return null;
        }
    }

    // Validate that the key looks like a Stripe key
    if (!trimmedKey.startsWith('sk_test_') && !trimmedKey.startsWith('sk_live_')) {
        console.error('Invalid Stripe key format. Key should start with sk_test_ or sk_live_');
        return null;
    }

    return trimmedKey;
}

// Initialize Stripe lazily
function getStripe() {
    if (!stripe) {
        const key = getStripeKey();
        if (key) {
            stripe = require('stripe')(key);
        } else {
            console.error('Stripe key missing or invalid');
        }
    }
    return stripe;
}

class PaymentService {
    /**
     * Create a Stripe Checkout Session for a subscription
     * @param {string} hostId - The internal ID of the host
     * @param {string} email - The host's email
     * @param {string} priceId - The Stripe Price ID for the chosen plan
     */
    async createCheckoutSession(hostId, email, priceId) {
        try {
            const session = await getStripe().checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                customer_email: email,
                client_reference_id: hostId,
                success_url: `${process.env.CLIENT_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/pricing?payment=cancelled`,
                metadata: {
                    hostId: hostId
                }
            });

            return session;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }
    }

    /**
     * Handle Stripe Webhook Events
     * @param {Object} event - The Stripe event object
     */
    async handleWebhook(event) {
        switch (event.type) {
            case 'checkout.session.completed':
                await this._handleSubscriptionCreated(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                // Extend validity, logs etc.
                await this._handlePaymentSucceeded(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this._handleSubscriptionCancelled(event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    }

    async _handleSubscriptionCreated(session) {
        const hostId = session.client_reference_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        // Calculate default validity (e.g. 1 month from now)
        // In a real scenario, we might query the subscription object for 'current_period_end'
        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        const validUntil = new Date(subscription.current_period_end * 1000);

        const queryText = `
            UPDATE hosts 
            SET stripe_customer_id = $1, 
                subscription_status = 'active',
                subscription_plan = $2,
                subscription_valid_until = $3
            WHERE id = $4
        `;

        // We assume plan name from metadata or lookup, here simplifying for MVP
        const planName = 'standard_monthly';

        await query(queryText, [customerId, planName, validUntil, hostId]);
        console.log(`Host ${hostId} subscription activated.`);
    }

    async _handlePaymentSucceeded(invoice) {
        if (!invoice.subscription) return;

        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        const validUntil = new Date(subscription.current_period_end * 1000);

        const queryText = `
            UPDATE hosts 
            SET subscription_valid_until = $1,
                subscription_status = 'active'
            WHERE stripe_customer_id = $2
        `;

        await query(queryText, [validUntil, customerId]);
        console.log(`Subscription renewed for customer ${customerId}`);
    }

    async _handleSubscriptionCancelled(subscription) {
        const customerId = subscription.customer;
        const queryText = `
            UPDATE hosts 
            SET subscription_status = 'cancelled'
            WHERE stripe_customer_id = $1
        `;
        await query(queryText, [customerId]);
        console.log(`Subscription cancelled for customer ${customerId}`);
    }
}

module.exports = new PaymentService();
