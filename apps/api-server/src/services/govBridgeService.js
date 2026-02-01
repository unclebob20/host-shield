const axios = require('axios');
const { create } = require('xmlbuilder2');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
          'BirthDate': guest.date_of_birth || guest.dob,
          'Nationality': guest.nationality_iso3 || guest.countryCode || guest.nationality,
          'PassportNumber': guest.document_number || guest.passportNumber,
          'StayDetails': {
            'ArrivalDate': guest.arrival_date || guest.arrivalDate,
            'DepartureDate': guest.departure_date || guest.departureDate
          }
        }
      }
    };
    // We MUST include the XML declaration at the top
    return create({ version: '1.0', encoding: 'UTF-8' }, xmlObj).end({ prettyPrint: false });
  }

  getApiJwt() {
    if (this.apiToken) return this.apiToken;
    if (!this.privateKeyPath) {
      throw new Error('Missing BRIDGE_API_TOKEN or BRIDGE_PRIVATE_KEY_PATH');
    }

    // Safety check: Ensure it's a file, not a directory (common Docker volume issue)
    if (fs.existsSync(this.privateKeyPath) && fs.lstatSync(this.privateKeyPath).isDirectory()) {
      throw new Error(`Configuration Error: ${this.privateKeyPath} is a directory. Please check your Docker volume mounts.`);
    }

    const privateKey = fs.readFileSync(this.privateKeyPath, 'utf8');
    const now = Math.floor(Date.now() / 1000);
    // 32+ chars, [0-9a-z\-_]
    const jti = crypto.randomUUID().replace(/-/g, '');

    const payload = {
      sub: this.apiSubject,
      exp: now + 240, // Max 5 minutes allowed by GovBridge logic
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
  }

  async sendToGov(guestData) {
    const xmlString = this.generateXml(guestData);
    const token = this.getApiJwt();

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