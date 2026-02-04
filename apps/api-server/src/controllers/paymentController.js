const paymentService = require('../services/paymentService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
    try {
        const { priceId } = req.body;
        const { id, email } = req.user; // Assuming auth middleware populates req.user

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
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
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
