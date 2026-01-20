const express = require('express');
const { registerGuest } = require('../controllers/guestController');
const router = express.Router();

router.post('/register', registerGuest);

module.exports = router;