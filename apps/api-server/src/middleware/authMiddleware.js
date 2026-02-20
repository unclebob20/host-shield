const { verifyToken } = require('../services/authService');
const { query } = require('../services/db');

/**
 * Middleware to require authentication on routes
 * Verifies JWT token from Authorization header and attaches host to request
 */
async function requireAuth(req, res, next) {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No authorization token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

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

        // Ensure it's an access token
        if (decoded.type !== 'access') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token type'
            });
        }

        // Fetch host from database to ensure they still exist
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

        // Attach host to request object (using authenticatedHost to avoid conflict with Express's req.host)
        req.authenticatedHost = rows[0];
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
}

/**
 * Optional auth middleware - attaches host if token is present, but doesn't require it
 */
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // No token, continue without auth
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (decoded.type === 'access') {
            const { rows } = await query(
                'SELECT id, email, full_name, police_provider_id, is_admin FROM hosts WHERE id = $1',
                [decoded.hostId]
            );
            if (rows.length > 0) {
                req.authenticatedHost = rows[0];
            }
        }
    } catch (error) {
        // Silently fail for optional auth
        console.warn('Optional auth failed:', error.message);
    }
    next();
}

module.exports = {
    requireAuth,
    optionalAuth
};
