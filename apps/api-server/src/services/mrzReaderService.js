const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

/**
 * MRZ Reader Service - Calls PassportEye microservice
 */

const MRZ_READER_URL = process.env.MRZ_READER_URL || 'http://localhost:8001';

async function extractMrzData(imagePath) {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(imagePath));

        const response = await axios.post(`${MRZ_READER_URL}/extract-mrz`, form, {
            headers: form.getHeaders(),
            timeout: 30000 // 30 second timeout
        });

        return response.data;
    } catch (error) {
        console.error('MRZ Reader error:', error.message);
        return {
            success: false,
            error: `MRZ extraction failed: ${error.message}`
        };
    }
}

module.exports = { extractMrzData };
