const express = require('express');
const { registerGuest, previewGuestXml } = require('../controllers/guestController');
const router = express.Router();

// Existing Sprint 1 endpoint: pushes a guest payload through to the gov-bridge.
router.post('/register', registerGuest);

// Sprint 2 helper: returns generated XML for a given host/guest pair.
router.post('/xml-preview', previewGuestXml);

module.exports = router;