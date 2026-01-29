const { query } = require('./db');

/**
 * Property Service
 * Handles CRUD operations for the properties table
 */

/**
 * Creates a new property
 * @param {string} hostId - ID of the host (owner)
 * @param {object} propertyData - { name, type }
 */
async function createProperty(hostId, propertyData) {
    const { name, type } = propertyData;
    const { rows } = await query(
        `INSERT INTO properties (host_id, name, type)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [hostId, name, type]
    );
    return rows[0];
}

/**
 * Fetches all properties for a specific host
 * @param {string} hostId - ID of the host
 */
async function getPropertiesByHostId(hostId) {
    const { rows } = await query(
        'SELECT * FROM properties WHERE host_id = $1 ORDER BY id ASC',
        [hostId]
    );
    return rows;
}

/**
 * Deletes a property
 * @param {string} hostId - ID of the host (for security)
 * @param {number} propertyId - ID of the property to delete
 */
async function deleteProperty(hostId, propertyId) {
    const { rowCount } = await query(
        'DELETE FROM properties WHERE id = $1 AND host_id = $2',
        [propertyId, hostId]
    );
    return rowCount > 0;
}

module.exports = {
    createProperty,
    getPropertiesByHostId,
    deleteProperty
};
