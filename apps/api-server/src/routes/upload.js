const express = require('express');
const multer = require('multer');
const { pdf } = require('pdf-to-img');
const { extractData } = require('../services/ocr_engine');
const router = express.Router();

// 1. Configure memory storage for solo-node efficiency
const upload = multer({ storage: multer.memoryStorage() });

router.post('/process-document', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No document uploaded' });

        let processedData;

        if (req.file.mimetype === 'application/pdf') {
            // 2. Handle PDF: Convert pages to high-res image buffers (scale 3 for accuracy)
            const document = await pdf(req.file.buffer, { scale: 3 });
            let combinedResults = [];
            
            for await (const pageBuffer of document) {
                const pageResult = await extractData(pageBuffer);
                combinedResults.push(pageResult);
            }
            // Logic to find the most complete data across pages (e.g., page with the MRZ)
            processedData = combinedResults.find(r => r.lastName) || combinedResults[0];
        } else {
            // 3. Handle Image: Direct OCR
            processedData = await extractData(req.file.buffer);
        }

        res.json({ success: true, data: processedData });
    } catch (error) {
        console.error('Processing Failure:', error);
        res.status(500).json({ error: 'Failed to extract document data' });
    }
});

module.exports = router;