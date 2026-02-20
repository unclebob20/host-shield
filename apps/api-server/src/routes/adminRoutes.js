const express = require('express');
const { getAllHosts, getHostById, getStats, updateSubscription } = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

// All admin routes are protected by requireAdmin middleware
router.get('/stats', requireAdmin, getStats);
router.get('/hosts', requireAdmin, getAllHosts);
router.get('/hosts/:id', requireAdmin, getHostById);
router.patch('/hosts/:id/subscription', requireAdmin, updateSubscription);

module.exports = router;
