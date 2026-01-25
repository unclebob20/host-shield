const express = require('express');
const {
    register,
    login,
    refresh,
    getProfile,
    updateProfile,
    updatePoliceId,
    changePassword
} = require('../controllers/hostController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

// Protected routes
router.get('/me', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);
router.put('/police-id', requireAuth, updatePoliceId);
router.put('/password', requireAuth, changePassword);

module.exports = router;
