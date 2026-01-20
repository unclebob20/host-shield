const axios = require('axios');
const { create } = require('xmlbuilder2');

class GovBridgeService {
  constructor() {
    // We stay on localhost:3001 for local Mac development
    this.baseUrl = 'http://localhost:3001/api';
    this.apiToken = process.env.BRIDGE_API_TOKEN || 'test_token_123';
  }

  generateXml(guest) {
    const xmlObj = {
      'RegistrationOfStay': {
        '@xmlns': 'http://schemas.gov.sk/form/MVSR.HlaseniePobytu/1.0',
        'Guest': {
          'FirstName': guest.firstName,
          'Surname': guest.lastName, // Schema uses 'Surname', not 'LastName'
          'BirthDate': guest.dob,
          'Nationality': guest.countryCode,
          'PassportNumber': guest.passportNumber,
          'StayDetails': {
            'ArrivalDate': guest.arrivalDate,
            'DepartureDate': guest.departureDate
          }
        }
      }
    };

    // We MUST include the XML declaration at the top
    return create({ version: '1.0', encoding: 'UTF-8' }, xmlObj).end({ prettyPrint: false });
  }

  async sendToGov(guestData) {
    const xmlString = this.generateXml(guestData);
    const base64Payload = Buffer.from(xmlString).toString('base64');

    try {
      const response = await axios.post(`${this.baseUrl}/eform/validate`, {
        data: base64Payload
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      // If the bridge gives a 400 or 500 error, we capture the specific message
      throw new Error(error.response?.data?.message || 'Bridge Connection Failed');
    }
  }
}

module.exports = new GovBridgeService();