const nodemailer = require('nodemailer');

/**
 * Mail Service
 * Handles sending emails via SMTP (Mailcow @ mail.ubmail.online)
 */

class MailService {
    constructor() {
        this.transporter = null;
    }

    /**
     * Get or initialize the SMTP transporter
     */
    getTransporter() {
        if (!this.transporter) {
            const host = process.env.SMTP_HOST || 'mail.ubmail.online';
            const port = parseInt(process.env.SMTP_PORT || '587');
            const user = process.env.SMTP_USER;
            const pass = process.env.SMTP_PASS;

            if (!user || !pass) {
                console.warn('⚠️ MailService: SMTP_USER or SMTP_PASS not configured. Emails will not be sent.');
                return null;
            }

            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465, // true for 465, false for other ports
                auth: {
                    user,
                    pass,
                },
                tls: {
                    // Do not fail on invalid certs (useful for some dev/custom environments)
                    rejectUnauthorized: process.env.NODE_ENV === 'production'
                }
            });
        }
        return this.transporter;
    }

    /**
     * Send an email
     * @param {Object} options - Email options
     * @param {string} options.to - Recipient email
     * @param {string} options.subject - Email subject
     * @param {string} options.text - Plain text content
     * @param {string} options.html - HTML content
     * @param {string} options.from - Sender email (defaults to SMTP_USER)
     */
    async sendMail({ to, subject, text, html, from }) {
        const transporter = this.getTransporter();
        if (!transporter) {
            console.error('❌ MailService: Transporter not initialized. Failed to send email to:', to);
            return { success: false, error: 'Mail server not configured' };
        }

        const mailOptions = {
            from: from || `"HostShield" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ MailService Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verify SMTP connection
     */
    async verifyConnection() {
        const transporter = this.getTransporter();
        if (!transporter) return false;

        try {
            await transporter.verify();
            console.log('🚀 SMTP Connection verified successfully');
            return true;
        } catch (error) {
            console.error('❌ SMTP Connection failed:', error);
            return false;
        }
    }
}

module.exports = new MailService();
