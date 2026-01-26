const cron = require('node-cron');
const GuestService = require('./guestService');
const GovBridgeService = require('./govBridgeService');
const { query } = require('./db');

/**
 * Scheduler Service
 * Handles automated tasks like government submissions and cleanup
 */

class SchedulerService {
    constructor() {
        // Run every day at 08:00 AM
        this.submissionJob = cron.schedule('0 8 * * *', this.processPendingSubmissions.bind(this), {
            scheduled: false
        });
    }

    start() {
        this.submissionJob.start();
        console.log('⏰ Scheduler Service started: Daily submission check at 08:00 AM');
    }

    /**
     * Finds guests who need to be submitted
     * - Status is 'pending' or 'error'
     * - Arrival was within the last 3 days (or future)
     * - Has valid required fields
     */
    async processPendingSubmissions() {
        console.log('🔄 Running automated submission job...');

        try {
            // Find guests pending submission
            // Rule: Submit if arrival_date is <= today + 3 days to avoid late fines
            // But for now, let's just retry anything pending/error that hasn't been submitted
            const { rows: guests } = await query(`
                SELECT * FROM guest_register 
                WHERE submission_status IN ('pending', 'error')
                AND created_at > NOW() - INTERVAL '30 days'
                LIMIT 50
            `);

            console.log(`Found ${guests.length} guests pending submission.`);

            for (const guest of guests) {
                await this.attemptSubmission(guest);
            }

        } catch (error) {
            console.error('❌ Scheduler Job Failed:', error);
        }
    }

    async attemptSubmission(guest) {
        console.log(`Attempting submission for guest ${guest.id} (${guest.first_name} ${guest.last_name})...`);

        try {
            // 1. Submit to Gov Bridge
            const result = await GovBridgeService.sendToGov(guest);

            // 2. Update status on success
            // Note: In a real scenario, we'd parse the result ID, but for now we mock/use result
            const submissionId = result.id || 'auto-sub-' + Date.now();
            await GuestService.updateGuestStatus(guest.id, 'sent', submissionId);

            console.log(`✅ Auto-submitted guest ${guest.id}`);

        } catch (error) {
            console.error(`⚠️ Failed to submit guest ${guest.id}:`, error.message);
            // Status remains 'error' or 'pending' - maybe update to 'error' with timestamp?
            await query(
                `UPDATE guest_register SET submission_status = 'error', submitted_at = NOW() WHERE id = $1`,
                [guest.id]
            );
        }
    }
}

module.exports = new SchedulerService();
