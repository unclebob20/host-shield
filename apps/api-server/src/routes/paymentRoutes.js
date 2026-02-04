const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming this exists

// Protected route to start payment
router.post('/create-checkout-session', authMiddleware.requireAuth, paymentController.createCheckoutSession);

// Webhook endpoint (must not use JSON parser middleware in main app if possible, or handle raw body)
// For simplicity in this quick setup, we assume we might need to adjust app.js for raw body parsing on this specific route
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
