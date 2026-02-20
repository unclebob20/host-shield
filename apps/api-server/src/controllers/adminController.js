const { query } = require('../services/db');

/**
 * GET /api/admin/hosts
 * Returns all hosts with subscription, guest count, and payment data.
 */
exports.getAllHosts = async (req, res) => {
    try {
        const { rows } = await query(`
            SELECT
                h.id,
                h.email,
                h.full_name,
                h.police_provider_id,
                h.stripe_customer_id,
                h.subscription_status,
                h.subscription_plan,
                h.subscription_valid_until,
                h.gov_credentials_verified,
                h.gov_credentials_verified_at,
                h.is_admin,
                h.created_at,
                COUNT(DISTINCT g.id)::int AS guest_count,
                COUNT(DISTINCT p.id)::int AS property_count
            FROM hosts h
            LEFT JOIN guest_register g ON g.host_id = h.id
            LEFT JOIN properties p ON p.host_id = h.id
            GROUP BY h.id
            ORDER BY h.created_at DESC
        `);

        res.json({ success: true, hosts: rows });
    } catch (error) {
        console.error('Admin getAllHosts error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch hosts' });
    }
};

/**
 * GET /api/admin/hosts/:id
 * Returns a single host with full detail including recent guests.
 */
exports.getHostById = async (req, res) => {
    try {
        const { id } = req.params;

        const hostResult = await query(`
            SELECT
                h.id,
                h.email,
                h.full_name,
                h.police_provider_id,
                h.stripe_customer_id,
                h.subscription_status,
                h.subscription_plan,
                h.subscription_valid_until,
                h.gov_credentials_verified,
                h.gov_credentials_verified_at,
                h.gov_ico,
                h.gov_api_subject,
                h.is_admin,
                h.created_at,
                COUNT(DISTINCT g.id)::int AS guest_count,
                COUNT(DISTINCT p.id)::int AS property_count
            FROM hosts h
            LEFT JOIN guest_register g ON g.host_id = h.id
            LEFT JOIN properties p ON p.host_id = h.id
            WHERE h.id = $1
            GROUP BY h.id
        `, [id]);

        if (hostResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Host not found' });
        }

        // Fetch recent guests for this host
        const guestsResult = await query(`
            SELECT id, first_name, last_name, nationality_iso3, arrival_date, departure_date, submission_status, created_at
            FROM guest_register
            WHERE host_id = $1
            ORDER BY created_at DESC
            LIMIT 20
        `, [id]);

        // Fetch properties
        const propertiesResult = await query(`
            SELECT id, name, address, type, created_at
            FROM properties
            WHERE host_id = $1
            ORDER BY created_at DESC
        `, [id]);

        res.json({
            success: true,
            host: hostResult.rows[0],
            guests: guestsResult.rows,
            properties: propertiesResult.rows
        });
    } catch (error) {
        console.error('Admin getHostById error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch host details' });
    }
};

/**
 * GET /api/admin/stats
 * Returns platform-wide stats.
 */
exports.getStats = async (req, res) => {
    try {
        const [hostsResult, guestsResult, subResult] = await Promise.all([
            query(`
                SELECT
                    COUNT(*)::int AS total_hosts,
                    COUNT(*) FILTER (WHERE subscription_status = 'active')::int AS active_subscribers,
                    COUNT(*) FILTER (WHERE subscription_status = 'inactive' OR subscription_status IS NULL)::int AS inactive_hosts,
                    COUNT(*) FILTER (WHERE gov_credentials_verified = TRUE)::int AS verified_hosts,
                    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS new_hosts_30d
                FROM hosts
                WHERE is_admin = FALSE OR is_admin IS NULL
            `),
            query(`
                SELECT
                    COUNT(*)::int AS total_guests,
                    COUNT(*) FILTER (WHERE submission_status = 'sent')::int AS submitted_guests,
                    COUNT(*) FILTER (WHERE submission_status = 'pending')::int AS pending_guests,
                    COUNT(*) FILTER (WHERE submission_status = 'error')::int AS error_guests,
                    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS new_guests_30d
                FROM guest_register
            `),
            // Monthly signups for chart (last 6 months)
            query(`
                SELECT
                    TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
                    DATE_TRUNC('month', created_at) AS month_date,
                    COUNT(*)::int AS count
                FROM hosts
                WHERE created_at >= NOW() - INTERVAL '6 months'
                  AND (is_admin = FALSE OR is_admin IS NULL)
                GROUP BY DATE_TRUNC('month', created_at)
                ORDER BY month_date ASC
            `)
        ]);

        res.json({
            success: true,
            stats: {
                ...hostsResult.rows[0],
                ...guestsResult.rows[0]
            },
            monthly_signups: subResult.rows
        });
    } catch (error) {
        console.error('Admin getStats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
};

/**
 * PATCH /api/admin/hosts/:id/subscription
 * Allows admin to manually set subscription status.
 */
exports.updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { subscription_status, subscription_plan, subscription_valid_until } = req.body;

        const { rows } = await query(`
            UPDATE hosts
            SET
                subscription_status = COALESCE($1, subscription_status),
                subscription_plan = COALESCE($2, subscription_plan),
                subscription_valid_until = COALESCE($3::timestamptz, subscription_valid_until)
            WHERE id = $4
            RETURNING id, email, full_name, subscription_status, subscription_plan, subscription_valid_until
        `, [subscription_status, subscription_plan, subscription_valid_until || null, id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Host not found' });
        }

        res.json({ success: true, host: rows[0] });
    } catch (error) {
        console.error('Admin updateSubscription error:', error);
        res.status(500).json({ success: false, error: 'Failed to update subscription' });
    }
};
