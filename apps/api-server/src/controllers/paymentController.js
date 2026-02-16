const paymentService = require('../services/paymentService');

// Helper to get Stripe instance (handles encrypted keys)
function getStripeInstance() {
    // Import the Stripe initialization from paymentService module
    // This ensures we use the same instance that handles decryption
    const stripeModule = require('stripe');
    const rawKey = process.env.STRIPE_SECRET_KEY;

    if (!rawKey) {
        throw new Error('STRIPE_SECRET_KEY not configured');
    }

    // If encrypted, the paymentService handles it
    // For webhook verification, we need our own instance
    let key = rawKey.trim();

    // Check if it's encrypted format
    if (key.startsWith('enc:')) {
        // Use the same decryption logic as paymentService
        const encryptionService = require('../services/encryptionService');
        try {
            const parts = key.split(':');
            if (parts.length === 4) {
                const iv = parts[1];
                const authTag = parts[2];
                const encryptedHex = parts[3];
                const decrypted = encryptionService.decrypt(
                    Buffer.from(encryptedHex, 'hex'),
                    Buffer.from(iv, 'hex'),
                    Buffer.from(authTag, 'hex')
                );
                key = decrypted.toString('utf8').trim();
            }
        } catch (e) {
            console.error('Failed to decrypt Stripe key:', e);
            throw new Error('Invalid encrypted Stripe key');
        }
    }

    return stripeModule(key);
}

const createCheckoutSession = async (req, res) => {
    try {
        const { priceId } = req.body;
        const { id, email } = req.authenticatedHost; // Auth middleware populates req.authenticatedHost

        if (!priceId) {
            return res.status(400).json({ error: 'Price ID is required' });
        }

        const session = await paymentService.createCheckoutSession(id, email, priceId);
        res.json({ url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
};

const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Verify webhook signature
        // Note: req.body needs to be raw buffer for this to work
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET not configured');
        }
        event = getStripeInstance().webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        await paymentService.handleWebhook(event);
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

module.exports = {
    createCheckoutSession,
    handleWebhook
};
