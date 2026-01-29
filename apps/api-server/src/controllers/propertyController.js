const PropertyService = require('../services/propertyService');

exports.getProperties = async (req, res) => {
    try {
        const hostId = req.authenticatedHost.id;
        const properties = await PropertyService.getPropertiesByHostId(hostId);
        res.status(200).json({ success: true, properties });
    } catch (error) {
        console.error('Get Properties Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch properties' });
    }
};

exports.createProperty = async (req, res) => {
    try {
        const hostId = req.authenticatedHost.id;
        const { name, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({ success: false, error: 'Name and Type are required' });
        }

        const property = await PropertyService.createProperty(hostId, { name, type });
        res.status(201).json({ success: true, property });
    } catch (error) {
        console.error('Create Property Error:', error);
        res.status(500).json({ success: false, error: 'Failed to create property' });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        const hostId = req.authenticatedHost.id;
        const { id } = req.params;

        const deleted = await PropertyService.deleteProperty(hostId, id);

        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Property not found or unauthorized' });
        }

        res.status(200).json({ success: true, message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Delete Property Error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete property' });
    }
};
