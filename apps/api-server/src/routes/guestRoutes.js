const express = require('express');
const { registerGuest, previewGuestXml } = require('../controllers/guestController');
const { requireAuth } = require('../middleware/authMiddleware');
const router = express.Router();

// All guest routes require authentication
router.use(requireAuth);

// Existing Sprint 1 endpoint: pushes a guest payload through to the gov-bridge.
router.post('/register', registerGuest);

// Sprint 2 helper: returns generated XML for a given host/guest pair.
router.post('/xml-preview', previewGuestXml);

module.exports = router;