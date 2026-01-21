const GovBridgeService = require('../services/govBridgeService');
const { buildGuestStayXml } = require('../services/xmlFactory');

exports.registerGuest = async (req, res) => {
  try {
    const result = await GovBridgeService.sendToGov(req.body);
    res.status(200).json({ success: true, govResponse: result });
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