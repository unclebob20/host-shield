const GovBridgeService = require('../services/govBridgeService');
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

    // 2. Submit to Gov Bridge
    let result;
    try {
      result = await GovBridgeService.sendToGov(guest);
      // 3. Update status on success
      await GuestService.updateGuestStatus(guestId, 'sent', 'mock-submission-id'); // Bridge doesn't return ID yet, mocking it
    } catch (bridgeError) {
      console.error('GovBridge submission failed:', bridgeError.message);
      // Update status on failure
      await GuestService.updateGuestStatus(guestId, 'error');
      throw bridgeError; // Re-throw to be caught by outer catch
    }

    res.status(200).json({
      success: true,
      govResponse: result,
      guestId: guestId,
      status: 'sent'
    });

  } catch (error) {
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