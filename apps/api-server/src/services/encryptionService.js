const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

/**
 * Encryption service for sensitive credential files
 * Uses AES-256-GCM for encryption
 */
class EncryptionService {
    constructor() {
        // Get encryption key from environment variable
        // In production, this should be stored in a secure key management service
        this.encryptionKey = process.env.CREDENTIAL_ENCRYPTION_KEY;

        if (!this.encryptionKey) {
            console.warn('⚠️  CREDENTIAL_ENCRYPTION_KEY not set - credentials will NOT be encrypted!');
            console.warn('   Generate one with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"');
        }

        // Validate key length (must be 32 bytes for AES-256)
        if (this.encryptionKey && Buffer.from(this.encryptionKey, 'hex').length !== 32) {
            throw new Error('CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
        }
    }

    /**
     * Encrypt data using AES-256-GCM
     * @param {Buffer|string} data - Data to encrypt
     * @returns {Object} - {encrypted: Buffer, iv: Buffer, authTag: Buffer}
     */
    encrypt(data) {
        if (!this.encryptionKey) {
            // If no encryption key, return data as-is (for development)
            return { encrypted: Buffer.from(data), iv: null, authTag: null };
        }

        const key = Buffer.from(this.encryptionKey, 'hex');
        const iv = crypto.randomBytes(16); // Initialization vector

        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

        const encrypted = Buffer.concat([
            cipher.update(data),
            cipher.final()
        ]);

        const authTag = cipher.getAuthTag();

        return { encrypted, iv, authTag };
    }

    /**
     * Decrypt data using AES-256-GCM
     * @param {Buffer} encrypted - Encrypted data
     * @param {Buffer} iv - Initialization vector
     * @param {Buffer} authTag - Authentication tag
     * @returns {Buffer} - Decrypted data
     */
    decrypt(encrypted, iv, authTag) {
        if (!this.encryptionKey || !iv || !authTag) {
            // If no encryption was used, return data as-is
            return encrypted;
        }

        const key = Buffer.from(this.encryptionKey, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);

        return decrypted;
    }

    /**
     * Encrypt and save a file
     * @param {string} filePath - Path to save encrypted file
     * @param {Buffer|string} data - Data to encrypt and save
     * @returns {Promise<Object>} - Metadata for decryption
     */
    async encryptFile(filePath, data) {
        const { encrypted, iv, authTag } = this.encrypt(data);

        // Save encrypted file
        await fs.writeFile(filePath, encrypted);

        // Set restrictive permissions
        await fs.chmod(filePath, 0o600);

        // Return metadata needed for decryption
        // Store this in database alongside file path
        return {
            iv: iv ? iv.toString('hex') : null,
            authTag: authTag ? authTag.toString('hex') : null,
            encrypted: !!this.encryptionKey
        };
    }

    /**
     * Read and decrypt a file
     * @param {string} filePath - Path to encrypted file
     * @param {Object} metadata - Decryption metadata
     * @param {string} metadata.iv - Initialization vector (hex)
     * @param {string} metadata.authTag - Authentication tag (hex)
     * @returns {Promise<Buffer>} - Decrypted data
     */
    async decryptFile(filePath, metadata) {
        const encrypted = await fs.readFile(filePath);

        if (!metadata.iv || !metadata.authTag) {
            // File was not encrypted
            return encrypted;
        }

        const iv = Buffer.from(metadata.iv, 'hex');
        const authTag = Buffer.from(metadata.authTag, 'hex');

        return this.decrypt(encrypted, iv, authTag);
    }

    /**
     * Generate a new encryption key
     * @returns {string} - 32-byte key as hex string
     */
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}

module.exports = new EncryptionService();
