const { verifyToken } = require('../services/authService');
const { query } = require('../services/db');

/**
 * Middleware to require admin authentication.
 * Must be used AFTER requireAuth, or can be used standalone (includes full auth check).
 * Checks is_admin = TRUE on the hosts table.
 */
async function requireAdmin(req, res, next) {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No authorization token provided'
            });
        }

        const token = authHeader.substring(7);

        // Verify token
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: error.message
            });
        }

        if (decoded.type !== 'access') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token type'
            });
        }

        // Fetch host including is_admin flag
        const { rows } = await query(
            'SELECT id, email, full_name, police_provider_id, is_admin FROM hosts WHERE id = $1',
            [decoded.hostId]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Host not found'
            });
        }

        const host = rows[0];

        if (!host.is_admin) {
            return res.status(403).json({
                success: false,
                error: 'Access denied: admin privileges required'
            });
        }

        req.authenticatedHost = host;
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
}

module.exports = { requireAdmin };
