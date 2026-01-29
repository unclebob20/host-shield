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
        document_expiry_date,
        arrival_date,
        departure_date,
        purpose_of_stay,
        objectId // Came from frontend
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
      document_expiry_date,
      arrival_date, 
      departure_date, 
      purpose_of_stay,
      object_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
        [
            hostId,
            first_name,
            last_name,
            date_of_birth,
            nationality_iso3,
            document_type,
            document_number,
            document_expiry_date,
            arrival_date,
            departure_date,
            purpose_of_stay || 'turistika',
            objectId || null
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
    getGuestById,
    updateGuestStatus,
    getGuestsByHostId
};

/**
 * Fetches all guests for a specific host
 * @param {string} hostId - ID of the host
 */
async function getGuestsByHostId(hostId) {
    const { rows } = await query(
        'SELECT * FROM guest_register WHERE host_id = $1 ORDER BY created_at DESC',
        [hostId]
    );
    return rows;
}


/**
 * Updates the government submission status of a guest
 * @param {string} guestId - ID of the guest
 * @param {string} status - New status (pending, sent, error, confirmed)
 * @param {string} [submissionId] - Optional ID returned by government API
 */
async function updateGuestStatus(guestId, status, submissionId = null) {
    const updates = ['submission_status = $2'];
    const params = [guestId, status];
    let paramIndex = 3;

    if (status === 'sent' || status === 'confirmed') {
        updates.push(`submitted_at = NOW()`);
    }

    if (submissionId) {
        updates.push(`gov_submission_id = $${paramIndex}`);
        params.push(submissionId);
        paramIndex++;
    }

    const queryText = `
        UPDATE guest_register 
        SET ${updates.join(', ')} 
        WHERE id = $1
        RETURNING *
    `;

    const { rows } = await query(queryText, params);
    return rows[0];
}
