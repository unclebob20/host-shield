const { query } = require('../services/db');
const fs = require('fs').promises;
const path = require('path');
const GovBridgeService = require('../services/govBridgeService');
const govCredentialsService = require('../services/govCredentialsService');
const encryptionService = require('../services/encryptionService');

/**
 * Get credential status for a host
 */
exports.getCredentialStatus = async (req, res) => {
    try {
        const { hostId } = req.params;

        // Verify host ownership
        if (req.authenticatedHost.id !== hostId) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const result = await query(
            `SELECT gov_ico, gov_api_subject, gov_credentials_verified, gov_credentials_verified_at
       FROM hosts WHERE id = $1`,
            [hostId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Host not found' });
        }

        const host = result.rows[0];

        res.json({
            success: true,
            credentials: {
                ico: host.gov_ico,
                apiSubject: host.gov_api_subject,
                verified: host.gov_credentials_verified,
                verifiedAt: host.gov_credentials_verified_at,
                configured: !!(host.gov_ico && host.gov_api_subject)
            }
        });
    } catch (error) {
        console.error('Get credential status error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Upload and configure government credentials
 */
exports.uploadCredentials = async (req, res) => {
    try {
        const { hostId } = req.params;
        const { ico, apiSubject, keystorePassword } = req.body;

        // Verify host ownership
        if (req.authenticatedHost.id !== hostId) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        // Validate required fields
        if (!ico || !apiSubject) {
            return res.status(400).json({
                success: false,
                error: 'ICO and API Subject are required'
            });
        }

        if (!keystorePassword) {
            return res.status(400).json({
                success: false,
                error: 'Keystore password is required'
            });
        }

        // Validate files
        if (!req.files || !req.files.keystore) {
            return res.status(400).json({
                success: false,
                error: 'Keystore file (.p12) is required'
            });
        }

        const keystoreFile = req.files.keystore[0];

        // "Normalize" the keystore:
        // 1. Verify user password (by opening it)
        // 2. Re-encrypt with Bridge password
        // 3. Save to Shared Volume where Bridge can see it
        console.log(`🔐 Normalizing credentials for Subject ${apiSubject} (ICO: ${ico})...`);

        const sharedPath = await govCredentialsService.saveHostKeystore(
            hostId,
            apiSubject,
            keystoreFile.buffer,
            keystorePassword
        );

        // Update database pointing to the shared volume path
        // We assume the service returns an absolute path, but we might store relative path if needed.
        // For simplicity and clarity, we store the path we got.

        await query(
            `UPDATE hosts 
       SET gov_ico = $1, 
           gov_api_subject = $2, 
           gov_keystore_path = $3, 
           gov_credentials_verified = false,
           gov_credentials_verified_at = NULL,
           -- Clear legacy encryption fields as we use the shared volume now
           gov_keystore_iv = NULL,
           gov_keystore_auth_tag = NULL,
           gov_private_key_path = NULL,
           gov_private_key_iv = NULL,
           gov_private_key_auth_tag = NULL,
           gov_keystore_data = NULL,
           gov_private_key_data = NULL
       WHERE id = $4`,
            [
                ico,
                apiSubject,
                sharedPath,
                hostId
            ]
        );

        console.log('✅ Credentials normalized and stored in Shared Volume');

        res.json({
            success: true,
            message: 'Credentials uploaded and ready for GovBridge.',
            credentials: {
                ico,
                apiSubject,
                verified: false,
                path: sharedPath
            }
        });
    } catch (error) {
        console.error('Upload credentials error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Verify credentials by testing authentication
 */
exports.verifyCredentials = async (req, res) => {
    try {
        const { hostId } = req.params;

        // Verify host ownership
        if (req.authenticatedHost.id !== hostId) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        // Fetch credentials
        // We now rely on gov_api_subject and gov_keystore_path (pointing to normalized .p12)
        const result = await query(
            `SELECT gov_ico, gov_api_subject, gov_keystore_path
       FROM hosts WHERE id = $1`,
            [hostId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Host not found' });
        }

        const host = result.rows[0];

        if (!host.gov_ico || !host.gov_api_subject) {
            return res.status(400).json({
                success: false,
                error: 'Credentials not configured. Please upload credentials first.'
            });
        }

        // Prepare credentials for testing
        // We defer to GovBridgeService to find the keystore in the correct directory
        // This makes the system robust against path changes (e.g. /usr/... vs /app/...)
        const credentials = {
            apiSubject: host.gov_api_subject,
            // privateKeyPath: host.gov_keystore_path // Don't use DB path, it might be stale
        };

        // If path is missing but we have subject, GovBridgeService logic will try to find it in default dir.

        // Test 1: Try to generate JWT (will use normalized key)
        let token;
        try {
            token = await GovBridgeService.getApiJwt(credentials);
        } catch (error) {
            console.error('JWT Generation Failed:', error);
            return res.status(400).json({
                success: false,
                error: 'Failed to generate JWT. Please check your credentials.',
                details: error.message
            });
        }

        // Test 2: Try to authenticate with GovBridge (using a dummy guest)
        const testGuest = {
            first_name: 'TEST',
            last_name: 'VERIFICATION',
            date_of_birth: '1990-01-01',
            nationality_iso3: 'SVK',
            document_number: 'TEST123456',
            arrival_date: new Date().toISOString().split('T')[0],
            departure_date: new Date(Date.now() + 86400000).toISOString().split('T')[0]
        };

        try {
            await GovBridgeService.sendToGov(testGuest, credentials);

            // If we get here, verification succeeded
            await query(
                `UPDATE hosts 
         SET gov_credentials_verified = true,
             gov_credentials_verified_at = NOW()
         WHERE id = $1`,
                [hostId]
            );

            res.json({
                success: true,
                message: 'Credentials verified successfully!',
                verified: true,
                verifiedAt: new Date().toISOString()
            });
        } catch (error) {
            // Authentication failed
            // DEBUG: If we get a 400 Bad Request or 'Validation' error, it means Auth SUCCEEDED but Data was invalid.
            // We count this as "Verified" for the purpose of checking credentials.
            const isAuthError = error.message.includes('401') || error.message.includes('403') || error.message.includes('Unauthorized') || error.message.includes('InvalidSubError') || error.message.includes('Bad credentials');

            if (!isAuthError && (error.message.includes('400') || error.message.includes('Bad Request') || error.message.includes('validation') || error.message.includes('Invalid form'))) {
                console.log('Credential Verification: Auth OK, Data Invalid (Ignoring for Connectivity Check)');
                await query(
                    `UPDATE hosts 
                 SET gov_credentials_verified = true,
                     gov_credentials_verified_at = NOW()
                 WHERE id = $1`,
                    [hostId]
                );

                return res.json({
                    success: true,
                    message: 'Credentials verified! (Note: Validation warnings present)',
                    verified: true,
                    verifiedAt: new Date().toISOString()
                });
            }

            res.status(400).json({
                success: false,
                error: 'Credential verification failed. Please check your credentials.',
                details: error.message
            });
        }
    } catch (error) {
        console.error('Verify credentials error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Delete credentials
 */
exports.deleteCredentials = async (req, res) => {
    try {
        const { hostId } = req.params;

        // Verify host ownership
        if (req.authenticatedHost.id !== hostId) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        // Fetch current credentials
        const result = await query(
            `SELECT gov_keystore_path, gov_private_key_path FROM hosts WHERE id = $1`,
            [hostId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Host not found' });
        }

        const host = result.rows[0];

        // Delete files if they exist
        if (host.gov_keystore_path) {
            const keystorePath = path.join(__dirname, '../../', host.gov_keystore_path);
            try {
                await fs.unlink(keystorePath);
            } catch (error) {
                console.warn('Failed to delete keystore file:', error.message);
            }
        }

        if (host.gov_private_key_path) {
            const privateKeyPath = path.join(__dirname, '../../', host.gov_private_key_path);
            try {
                await fs.unlink(privateKeyPath);
            } catch (error) {
                console.warn('Failed to delete private key file:', error.message);
            }
        }

        // Clear database fields
        await query(
            `UPDATE hosts 
       SET gov_ico = NULL,
           gov_api_subject = NULL,
           gov_keystore_path = NULL,
           gov_private_key_path = NULL,
           gov_keystore_data = NULL,
           gov_private_key_data = NULL,
           gov_credentials_verified = false,
           gov_credentials_verified_at = NULL
       WHERE id = $1`,
            [hostId]
        );

        res.json({
            success: true,
            message: 'Credentials deleted successfully'
        });
    } catch (error) {
        console.error('Delete credentials error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
