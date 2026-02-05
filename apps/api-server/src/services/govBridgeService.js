const axios = require('axios');
const { create } = require('xmlbuilder2');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const encryptionService = require('./encryptionService');

class GovBridgeService {
  constructor() {
    // Default is local dev; in Docker Compose we override via BRIDGE_BASE_URL
    this.baseUrl = process.env.BRIDGE_BASE_URL || 'http://localhost:3001/api';
    // Back-compat: if you provide BRIDGE_API_TOKEN (a pre-built JWT), we'll use it.
    this.apiToken = process.env.BRIDGE_API_TOKEN || null;
    // HARDCODED for debugging - must match API_TOKEN in gov-bridge
    this.apiSubject = 'boris_hostshield_test';
    this.privateKeyPath = process.env.BRIDGE_PRIVATE_KEY_PATH || null;

    console.log('GovBridgeService Config:', {
      baseUrl: this.baseUrl,
      apiSubject: this.apiSubject,
      privateKeyPath: this.privateKeyPath
    });
  }

  generateXml(guest) {
    const xmlObj = {
      'RegistrationOfStay': {
        '@xmlns': 'http://schemas.gov.sk/form/MVSR.HlaseniePobytu/1.0',
        'Guest': {
          'FirstName': guest.first_name || guest.firstName,
          'Surname': guest.last_name || guest.lastName,
          'DateOfBirth': guest.date_of_birth || guest.dateOfBirth,
          'Nationality': guest.nationality_iso3 || guest.countryCode || guest.nationality,
          'DocumentNumber': guest.document_number || guest.passportNumber,
          'ArrivalDate': guest.arrival_date || guest.arrivalDate,
          'DepartureDate': guest.departure_date || guest.departureDate
        }
      }
    };
    // We MUST include the XML declaration at the top
    return create({ version: '1.0', encoding: 'UTF-8' }, xmlObj).end({ prettyPrint: false });
  }

  /**
   * Generate a JWT token for API authentication
   * @param {Object} credentials - Host's government credentials
   * @param {string} credentials.apiSubject - Subject identifier (usually ICO)
   * @param {string} credentials.privateKeyPath - Path to private key file
   * @param {Object} credentials.privateKeyMetadata - Decryption metadata (iv, authTag)
   * @returns {Promise<string>} JWT token
   */
  async getApiJwt(credentials) {
    // Use provided credentials or fall back to environment defaults (for testing)
    const apiSubject = credentials?.apiSubject || this.apiSubject;
    const privateKeyPath = credentials?.privateKeyPath || this.privateKeyPath;
    const privateKeyMetadata = credentials?.privateKeyMetadata || {};

    console.log('DEBUG: Generating JWT for subject:', apiSubject);
    console.log('DEBUG: Private Key Path:', privateKeyPath);

    if (this.apiToken) return this.apiToken;
    if (!privateKeyPath) {
      throw new Error('Missing BRIDGE_API_TOKEN or privateKeyPath in credentials');
    }

    // Safety check: Ensure it's a file, not a directory
    if (fs.existsSync(privateKeyPath) && fs.lstatSync(privateKeyPath).isDirectory()) {
      throw new Error(`Configuration Error: ${privateKeyPath} is a directory. Use a file.`);
    }

    try {
      console.log('DEBUG: Metadata IV present?', !!(privateKeyMetadata?.iv));

      // Decrypt private key if encryption metadata exists
      let privateKey;
      if (privateKeyMetadata.iv && privateKeyMetadata.authTag) {
        console.log('🔓 Decrypting private key file...');
        const decrypted = await encryptionService.decryptFile(privateKeyPath, privateKeyMetadata);
        privateKey = decrypted.toString('utf8');
      } else {
        // No encryption metadata - read as plain text
        console.log('📖 Reading private key as plain text...');
        privateKey = fs.readFileSync(privateKeyPath, 'utf8');
        console.log(`DEBUG: Key Length: ${privateKey.length}`);
        console.log(`DEBUG: Key Preview: ${privateKey.substring(0, 100).replace(/\n/g, '\\n')}...`);
      }

      const now = Math.floor(Date.now() / 1000);
      const jti = crypto.randomUUID().replace(/-/g, '');

      const payload = {
        sub: apiSubject,
        exp: now + 240,
        jti
      };

      const token = jwt.sign(
        payload,
        privateKey,
        { algorithm: 'RS256' }
      );

      console.log('Generating GovBridge JWT:', {
        payload,
        tokenSub: jwt.decode(token).sub
      });

      return token;
    } catch (error) {
      console.error('ERROR in getApiJwt:', error);
      throw error;
    }
  }

  /**
   * Submit guest data to GovBridge for validation
   * @param {Object} guestData - Guest information
   * @param {Object} credentials - Host's government credentials (optional, uses defaults if not provided)
   * @param {string} credentials.apiSubject - Subject identifier (usually ICO)
   * @param {string} credentials.privateKeyPath - Path to private key file
   * @returns {Promise<Object>} Validation response
   */
  async sendToGov(guestData, credentials = null) {
    const xmlString = this.generateXml(guestData);
    const token = await this.getApiJwt(credentials);

    try {
      // Validate against a known eForm schema (Sprint 1 "plumbing" closure).
      // NOTE: This does not yet map to the final police submission schema.
      const response = await axios.post(
        `${this.baseUrl}/eform/validate`,
        { form: xmlString },
        {
          params: { identifier: 'App.GeneralAgenda', version: '1.9' },
          headers: {
            'Authorization': `Bearer ${token}`, // Restore Bearer prefix for JWT
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      const msg =
        (typeof data === 'string' && data) ||
        data?.message ||
        (status ? `Bridge responded ${status}` : null) ||
        error.message ||
        'Bridge Connection Failed';
      throw new Error(msg);
    }
  }
}

module.exports = new GovBridgeService();