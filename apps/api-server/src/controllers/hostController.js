const { hashPassword, comparePassword, generateTokenPair, verifyToken } = require('../services/authService');
const { query } = require('../services/db');

/**
 * Register a new host account
 * POST /api/auth/register
 * Body: { email, password, full_name, police_provider_id? }
 */
exports.register = async (req, res) => {
    try {
        const { email, password, full_name, police_provider_id } = req.body || {};

        // Validation
        if (!email || !password || !full_name) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and full name are required'
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Password strength validation (min 8 chars, at least one letter and one number)
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long'
            });
        }

        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (!hasLetter || !hasNumber) {
            return res.status(400).json({
                success: false,
                error: 'Password must contain at least one letter and one number'
            });
        }

        // Check if email already exists
        const existingHost = await query(
            'SELECT id FROM hosts WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingHost.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert new host
        const result = await query(
            `INSERT INTO hosts (email, hashed_password, full_name, police_provider_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, police_provider_id, created_at`,
            [email.toLowerCase(), hashedPassword, full_name, police_provider_id || null]
        );

        const newHost = result.rows[0];

        // Generate tokens
        const tokens = generateTokenPair(newHost);

        res.status(201).json({
            success: true,
            message: 'Host registered successfully',
            host: {
                id: newHost.id,
                email: newHost.email,
                full_name: newHost.full_name,
                police_provider_id: newHost.police_provider_id,
                created_at: newHost.created_at
            },
            ...tokens
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
};

/**
 * Login with email and password
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find host by email
        const result = await query(
            'SELECT * FROM hosts WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const host = result.rows[0];

        // Verify password
        const isValidPassword = await comparePassword(password, host.hashed_password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Generate tokens
        const tokens = generateTokenPair(host);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            host: {
                id: host.id,
                email: host.email,
                full_name: host.full_name,
                police_provider_id: host.police_provider_id,
                created_at: host.created_at
            },
            ...tokens
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
};

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh
 * Body: { refreshToken }
 */
exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body || {};

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyToken(refreshToken);
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: error.message
            });
        }

        // Ensure it's a refresh token
        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token type'
            });
        }

        // Fetch host to ensure they still exist
        const result = await query(
            'SELECT id, email, full_name, police_provider_id FROM hosts WHERE id = $1',
            [decoded.hostId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Host not found'
            });
        }

        const host = result.rows[0];

        // Generate new token pair
        const tokens = generateTokenPair(host);

        res.status(200).json({
            success: true,
            ...tokens
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            error: 'Token refresh failed'
        });
    }
};

/**
 * Get current authenticated host profile
 * GET /api/auth/me
 * Requires: Authentication
 */
exports.getProfile = async (req, res) => {
    try {
        // Host is already attached by requireAuth middleware
        res.status(200).json({
            success: true,
            host: req.authenticatedHost
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile'
        });
    }
};

/**
 * Update host profile (full name)
 * PUT /api/auth/profile
 * Body: { full_name }
 * Requires: Authentication
 */
exports.updateProfile = async (req, res) => {
    try {
        const { full_name } = req.body || {};

        if (!full_name || full_name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Full name is required'
            });
        }

        const result = await query(
            `UPDATE hosts 
       SET full_name = $1 
       WHERE id = $2 
       RETURNING id, email, full_name, police_provider_id, created_at`,
            [full_name.trim(), req.authenticatedHost.id]
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            host: result.rows[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
};

/**
 * Update police provider ID
 * PUT /api/auth/police-id
 * Body: { police_provider_id }
 * Requires: Authentication
 */
exports.updatePoliceId = async (req, res) => {
    try {
        const { police_provider_id } = req.body || {};

        // Allow null/empty to remove police ID
        const policeId = police_provider_id?.trim() || null;

        const result = await query(
            `UPDATE hosts 
       SET police_provider_id = $1 
       WHERE id = $2 
       RETURNING id, email, full_name, police_provider_id, created_at`,
            [policeId, req.authenticatedHost.id]
        );

        res.status(200).json({
            success: true,
            message: 'Police provider ID updated successfully',
            host: result.rows[0]
        });
    } catch (error) {
        console.error('Update police ID error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update police provider ID'
        });
    }
};

/**
 * Change password
 * PUT /api/auth/password
 * Body: { current_password, new_password }
 * Requires: Authentication
 */
exports.changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body || {};

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required'
            });
        }

        // Password strength validation for new password
        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 8 characters long'
            });
        }

        const hasLetter = /[a-zA-Z]/.test(new_password);
        const hasNumber = /[0-9]/.test(new_password);
        if (!hasLetter || !hasNumber) {
            return res.status(400).json({
                success: false,
                error: 'New password must contain at least one letter and one number'
            });
        }

        // Fetch current hashed password
        const result = await query(
            'SELECT hashed_password FROM hosts WHERE id = $1',
            [req.authenticatedHost.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Host not found'
            });
        }

        // Verify current password
        const isValidPassword = await comparePassword(
            current_password,
            result.rows[0].hashed_password
        );

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const newHashedPassword = await hashPassword(new_password);

        // Update password
        await query(
            'UPDATE hosts SET hashed_password = $1 WHERE id = $2',
            [newHashedPassword, req.authenticatedHost.id]
        );

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password'
        });
    }
};
