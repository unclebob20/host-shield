const axios = require('axios');
const { create } = require('xmlbuilder2');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
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
    // Helper to format dates as YYYY-MM-DD
    const formatDate = (dateValue) => {
      if (!dateValue) return '';
      // If it's a full ISO string (e.g. 2026-02-10T00:00:00.000Z), take the first 10 chars
      if (typeof dateValue === 'string' && dateValue.includes('T')) {
        return dateValue.split('T')[0];
      }
      // If it's a Date object
      if (dateValue instanceof Date) {
        return dateValue.toISOString().split('T')[0];
      }
      return dateValue;
    };

    const xmlObj = {
      'RegistrationOfStay': {
        '@xmlns': 'http://schemas.gov.sk/form/MVSR.HlaseniePobytu/1.0',
        'Guest': {
          'FirstName': guest.first_name || guest.firstName,
          'Surname': guest.last_name || guest.lastName,
          'DateOfBirth': formatDate(guest.date_of_birth || guest.dateOfBirth),
          'Nationality': guest.nationality_iso3 || guest.countryCode || guest.nationality,
          'DocumentNumber': guest.document_number || guest.passportNumber,
          'ArrivalDate': formatDate(guest.arrival_date || guest.arrivalDate),
          'DepartureDate': formatDate(guest.departure_date || guest.departureDate)
        }
      }
    };
    // We MUST include the XML declaration at the top
    const xmlString = create({ version: '1.0', encoding: 'UTF-8' }, xmlObj).end({ prettyPrint: false });
    console.log('DEBUG: Generated XML Payload:', xmlString);
    return xmlString;
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
    const apiSubject = (credentials?.apiSubject || this.apiSubject || '').trim();

    // Determine keystore directory with better fallback for Docker
    let keystoreDir = process.env.GOV_KEYSTORE_DIR;
    if (!keystoreDir) {
      // Check for standard Docker path
      if (fs.existsSync('/app/security/hosts')) {
        keystoreDir = '/app/security/hosts';
      } else {
        // Fallback for local development
        keystoreDir = path.join(__dirname, '../../../../security/hosts');
      }
    }

    // Explicit path override (legacy or test)
    let privateKeyPath = credentials?.privateKeyPath || this.privateKeyPath;

    // Use Master Key from Env if not provided
    if (!privateKeyPath) {
      privateKeyPath = process.env.BRIDGE_PRIVATE_KEY_PATH;
    }

    // We assume the Master Key is a PEM file (RSA Private Key)
    // We do NOT use the Host's .p12 for signing the API Token.
    // The Host's .p12 is for the Bridge to use for SOAP signing.

    if (this.apiToken) return this.apiToken;
    if (!privateKeyPath) {
      throw new Error(`Missing Bridge Private Key configuration. Cannot sign JWT.`);
    }

    if (this.apiToken) return this.apiToken;
    if (!privateKeyPath) {
      throw new Error(`Missing credentials for subject ${apiSubject}. No keystore found.`);
    }

    // Safety check
    if (fs.existsSync(privateKeyPath) && fs.lstatSync(privateKeyPath).isDirectory()) {
      throw new Error(`Configuration Error: ${privateKeyPath} is a directory. Use a file.`);
    }

    try {
      let privateKey;
      const isP12 = privateKeyPath.endsWith('.p12');
      const bridgePassword = process.env.BRIDGE_KEYSTORE_PASSWORD || 'changeit';

      if (isP12) {
        // Extract private key from the normalized P12 using the known bridge password
        // We use openssl here to convert P12 -> PEM for jwt.sign
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);

        try {
          // -nodes: No encryption on the output key (we need raw PEM for jwt.sign)
          const { stdout } = await execAsync(`openssl pkcs12 -in "${privateKeyPath}" -nodes -passin pass:"${bridgePassword}" -legacy`);
          privateKey = stdout;
        } catch (err) {
          throw new Error(`Failed to extract key from P12 for ${apiSubject}: ${err.message}`);
        }
      } else {
        // Legacy/Dev: Handle raw key files or encrypted custom files
        const privateKeyMetadata = credentials?.privateKeyMetadata || {};
        if (privateKeyMetadata.iv && privateKeyMetadata.authTag) {
          const decrypted = await encryptionService.decryptFile(privateKeyPath, privateKeyMetadata);
          privateKey = decrypted.toString('utf8');
        } else {
          privateKey = fs.readFileSync(privateKeyPath, 'utf8');
        }
      }

      const now = Math.floor(Date.now() / 1000);
      const jti = crypto.randomUUID().replace(/-/g, '');

      const payload = {
        sub: apiSubject,
        iss: apiSubject,
        nbf: now - 60,
        exp: now + 240,
        jti
      };

      console.log('DEBUG: Generated JWT Payload sub:', `"${payload.sub}"`);

      const token = jwt.sign(
        payload,
        privateKey,
        { algorithm: 'RS256' }
      );

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
          params: { identifier: 'MVSR.HlaseniePobytu', version: '1.0' },
          headers: {
            'Authorization': `Bearer ${token}`, // Restore Bearer prefix for JWT
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('DEBUG: GovBridge Axios Error:', error.response?.data || error.message);

      const status = error.response?.status;
      const data = error.response?.data;
      const msg = (typeof data === 'string' && data) || data?.message || error.message;
      const finalMsg =
        (status ? `Bridge responded ${status}: ` : '') +
        (msg || 'Bridge Connection Failed');
      throw new Error(finalMsg);
    }
  }
}

module.exports = new GovBridgeService();