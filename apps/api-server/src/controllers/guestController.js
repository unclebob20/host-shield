const GovBridgeService = require('../services/govBridgeService');
const { query } = require('../services/db');
const { buildGuestStayXml } = require('../services/xmlFactory');
const GuestService = require('../services/guestService');

/**
 * Saves a guest to the database
 * Typically called after OCR scan and user confirmation
 */
exports.saveGuest = async (req, res) => {
  try {
    const hostId = req.authenticatedHost.id;
    const guestData = req.body;

    const guest = await GuestService.createGuest(hostId, guestData);

    res.status(201).json({
      success: true,
      message: 'Guest saved successfully',
      guest
    });
  } catch (error) {
    console.error('Save Guest Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.registerGuest = async (req, res) => {
  try {
    const hostId = req.authenticatedHost.id;
    const { guestId } = req.body;

    if (!guestId) {
      return res.status(400).json({ success: false, error: 'guestId is required' });
    }

    // 1. Fetch guest from DB to ensure validity and ownership
    const guest = await GuestService.getGuestById(hostId, guestId);
    if (!guest) {
      return res.status(404).json({ success: false, error: 'Guest not found' });
    }

    // 2. Fetch host's government credentials via property relationship
    // Guest -> Property -> Host -> Credentials
    // 2. Fetch host's government credentials via property relationship
    // Guest -> Property -> Host -> Credentials
    const hostCredentials = await query(
      `SELECT h.gov_ico, h.gov_api_subject, h.gov_private_key_path, h.gov_credentials_verified,
              h.gov_private_key_iv, h.gov_private_key_auth_tag
       FROM hosts h
       JOIN properties p ON p.host_id = h.id
       JOIN guest_register g ON g.property_id = p.id
       WHERE g.id = $1 AND h.id = $2`,
      [guestId, hostId]
    );

    if (!hostCredentials.rows || hostCredentials.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Host credentials not found. Please configure your government credentials first.'
      });
    }

    const credentials = hostCredentials.rows[0];

    // Check if credentials are verified
    if (!credentials.gov_credentials_verified) {
      return res.status(400).json({
        success: false,
        error: 'Government credentials not verified. Please verify your credentials before submitting guests.'
      });
    }

    // Prepare credentials object for GovBridgeService (with encryption metadata)
    const govCredentials = {
      apiSubject: credentials.gov_api_subject,
      privateKeyPath: credentials.gov_private_key_path,
      privateKeyMetadata: {
        iv: credentials.gov_private_key_iv,
        authTag: credentials.gov_private_key_auth_tag
      }
    };

    // 3. Submit to Gov Bridge with host's credentials
    let result;
    try {
      result = await GovBridgeService.sendToGov(guest, govCredentials);
      // 4. Update status on success
      await GuestService.updateGuestStatus(guestId, 'sent', 'mock-submission-id'); // Bridge doesn't return ID yet, mocking it
    } catch (bridgeError) {
      console.error('GovBridge submission failed:', bridgeError.message);
      if (bridgeError.response) {
        console.error('GovBridge response data:', bridgeError.response.data);
        console.error('GovBridge status:', bridgeError.response.status);
      }
      // Update status on failure
      await GuestService.updateGuestStatus(guestId, 'error');
      throw new Error(`GovBridge: ${bridgeError.message}`); // Re-throw with context
    }

    res.status(200).json({
      success: true,
      govResponse: result,
      guestId: guestId,
      status: 'sent'
    });

  } catch (error) {
    console.error('Register Guest - Outer Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Sprint 2: XML Factory preview endpoint
// Accepts `{ host: {...}, guest: {...} }` and returns the generated XML.
exports.previewGuestXml = (req, res) => {
  try {
    const { host, guest } = req.body || {};
    const xml = buildGuestStayXml(host, guest);
    res
      .status(200)
      .type('application/xml')
      .send(xml);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Fetch all guests for the authenticated host
 */
exports.getGuests = async (req, res) => {
  try {
    const hostId = req.authenticatedHost.id;
    const guests = await GuestService.getGuestsByHostId(hostId);

    res.status(200).json({
      success: true,
      guests
    });
  } catch (error) {
    console.error('Get Guests Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch guests' });
  }
};