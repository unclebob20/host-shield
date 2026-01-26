const { extractMrzData } = require('../services/mrzReaderService');
const { deleteFile } = require('../services/storageService');

/**
 * OCR Controller - Uses PassportEye microservice for MRZ extraction
 */

exports.scanDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No document file uploaded' });
        }

        console.log(`Processing file: ${req.file.path}`);

        // Call PassportEye microservice for MRZ extraction
        const result = await extractMrzData(req.file.path);

        // Clean up the uploaded file
        await deleteFile(req.file.path);

        // Return results
        if (result.success) {
            res.status(200).json({
                success: true,
                data: result.data
            });
        } else {
            res.status(200).json({
                success: false,
                error: result.error || 'MRZ extraction failed'
            });
        }
    } catch (error) {
        console.error('Scan Error:', error);

        // Clean up file if error occurs
        if (req.file) {
            await deleteFile(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process document'
        });
    }
};
