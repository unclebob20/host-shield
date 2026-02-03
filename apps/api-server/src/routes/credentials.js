const express = require('express');
const router = express.Router();
const multer = require('multer');
const credentialsController = require('../controllers/credentialsController');
const { requireAuth } = require('../middleware/authMiddleware');

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Accept keystore and key files
        const allowedExtensions = ['.keystore', '.key', '.pem', '.jks'];
        const ext = file.originalname.substring(file.originalname.lastIndexOf('.'));

        if (allowedExtensions.includes(ext.toLowerCase())) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only .keystore, .key, .pem, and .jks files are allowed.'));
        }
    }
});

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/hosts/:hostId/credentials/status
 * Get credential configuration status
 */
router.get('/:hostId/credentials/status', credentialsController.getCredentialStatus);

/**
 * POST /api/hosts/:hostId/credentials
 * Upload government credentials
 * 
 * Body (multipart/form-data):
 * - ico: string (required)
 * - apiSubject: string (required)
 * - keystore: file (required)
 * - privateKey: file (required)
 */
router.post(
    '/:hostId/credentials',
    upload.fields([
        { name: 'keystore', maxCount: 1 },
        { name: 'privateKey', maxCount: 1 }
    ]),
    credentialsController.uploadCredentials
);

/**
 * POST /api/hosts/:hostId/credentials/verify
 * Verify credentials by testing authentication
 */
router.post('/:hostId/credentials/verify', credentialsController.verifyCredentials);

/**
 * DELETE /api/hosts/:hostId/credentials
 * Delete credentials
 */
router.delete('/:hostId/credentials', credentialsController.deleteCredentials);

module.exports = router;
