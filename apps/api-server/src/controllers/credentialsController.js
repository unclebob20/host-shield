const { query } = require('../services/db');
const fs = require('fs').promises;
const path = require('path');
const GovBridgeService = require('../services/govBridgeService');
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
        const { ico, apiSubject } = req.body;

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

        // Validate files
        if (!req.files || !req.files.keystore || !req.files.privateKey) {
            return res.status(400).json({
                success: false,
                error: 'Both keystore and private key files are required'
            });
        }

        const keystoreFile = req.files.keystore[0];
        const privateKeyFile = req.files.privateKey[0];

        // Create directory for host credentials
        const credentialsDir = path.join(__dirname, '../../security/hosts', hostId.toString());
        await fs.mkdir(credentialsDir, { recursive: true });

        // Define file paths
        const keystorePath = path.join(credentialsDir, `${ico}_prod.keystore`);
        const privateKeyPath = path.join(credentialsDir, `${ico}_private.key`);

        // Encrypt and save files
        console.log('🔐 Encrypting keystore file...');
        const keystoreMetadata = await encryptionService.encryptFile(keystorePath, keystoreFile.buffer);

        console.log('🔐 Encrypting private key file...');
        const privateKeyMetadata = await encryptionService.encryptFile(privateKeyPath, privateKeyFile.buffer);

        // Store relative paths in database
        const relativeKeystorePath = `security/hosts/${hostId}/${ico}_prod.keystore`;
        const relativePrivateKeyPath = `security/hosts/${hostId}/${ico}_private.key`;

        // Update database with encryption metadata
        await query(
            `UPDATE hosts 
       SET gov_ico = $1, 
           gov_api_subject = $2, 
           gov_keystore_path = $3, 
           gov_keystore_iv = $4,
           gov_keystore_auth_tag = $5,
           gov_private_key_path = $6,
           gov_private_key_iv = $7,
           gov_private_key_auth_tag = $8,
           gov_credentials_verified = false,
           gov_credentials_verified_at = NULL
       WHERE id = $9`,
            [
                ico,
                apiSubject,
                relativeKeystorePath,
                keystoreMetadata.iv,
                keystoreMetadata.authTag,
                relativePrivateKeyPath,
                privateKeyMetadata.iv,
                privateKeyMetadata.authTag,
                hostId
            ]
        );

        console.log('✅ Credentials encrypted and saved successfully');

        res.json({
            success: true,
            message: 'Credentials uploaded and encrypted successfully. Please verify them before use.',
            credentials: {
                ico,
                apiSubject,
                verified: false,
                encrypted: keystoreMetadata.encrypted
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

        // Fetch credentials with encryption metadata
        const result = await query(
            `SELECT gov_ico, gov_api_subject, gov_private_key_path, gov_keystore_path,
              gov_private_key_iv, gov_private_key_auth_tag,
              gov_keystore_iv, gov_keystore_auth_tag
       FROM hosts WHERE id = $1`,
            [hostId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Host not found' });
        }

        const host = result.rows[0];

        if (!host.gov_ico || !host.gov_private_key_path) {
            return res.status(400).json({
                success: false,
                error: 'Credentials not configured. Please upload credentials first.'
            });
        }

        // Prepare credentials for testing (with decryption metadata)
        const credentials = {
            apiSubject: host.gov_api_subject,
            privateKeyPath: path.join(__dirname, '../../', host.gov_private_key_path),
            privateKeyMetadata: {
                iv: host.gov_private_key_iv,
                authTag: host.gov_private_key_auth_tag
            }
        };

        // Test 1: Try to generate JWT (will decrypt file internally)
        let token;
        try {
            token = await GovBridgeService.getApiJwt(credentials);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Failed to generate JWT. Please check your private key file.',
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
