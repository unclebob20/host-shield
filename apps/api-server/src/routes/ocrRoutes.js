const express = require('express');
const { scanDocument } = require('../controllers/ocrController');
const { requireAuth } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

const router = express.Router();

/**
 * OCR Routes
 * All routes require authentication as they process sensitive guest data
 */

// POST /api/ocr/scan
// Header: Authorization: Bearer <token>
// Body (multipart/form-data): "document": <file>
router.post('/scan', requireAuth, uploadSingle, scanDocument);

module.exports = router;
