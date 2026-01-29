const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, propertyController.getProperties);
router.post('/', requireAuth, propertyController.createProperty);
router.delete('/:id', requireAuth, propertyController.deleteProperty);

module.exports = router;
