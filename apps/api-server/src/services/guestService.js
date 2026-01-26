const { query } = require('./db');

/**
 * Guest Service
 * Handles CRUD operations for the guest_register table
 */

/**
 * Creates a new guest entry in the register
 * @param {string} hostId - ID of the host (owner)
 * @param {object} guestData - Guest data from form/OCR
 */
async function createGuest(hostId, guestData) {
    const {
        first_name,
        last_name,
        date_of_birth,
        nationality_iso3,
        document_type,
        document_number,
        arrival_date,
        departure_date,
        purpose_of_stay
    } = guestData;

    const { rows } = await query(
        `INSERT INTO guest_register (
      host_id, 
      first_name, 
      last_name, 
      date_of_birth, 
      nationality_iso3, 
      document_type, 
      document_number, 
      arrival_date, 
      departure_date, 
      purpose_of_stay
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
        [
            hostId,
            first_name,
            last_name,
            date_of_birth,
            nationality_iso3,
            document_type,
            document_number,
            arrival_date,
            departure_date,
            purpose_of_stay || 'turistika'
        ]
    );

    return rows[0];
}

/**
 * Fetches a single guest by ID and host_id
 */
async function getGuestById(hostId, guestId) {
    const { rows } = await query(
        'SELECT * FROM guest_register WHERE id = $1 AND host_id = $2',
        [guestId, hostId]
    );
    return rows[0] || null;
}

module.exports = {
    createGuest,
    getGuestById
};
