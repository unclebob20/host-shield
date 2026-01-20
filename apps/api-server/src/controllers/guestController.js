const GovBridgeService = require('../services/govBridgeService');

exports.registerGuest = async (req, res) => {
    try {
        const result = await GovBridgeService.sendToGov(req.body);
        res.status(200).json({ success: true, govResponse: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};