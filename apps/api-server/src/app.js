const express = require('express');
const cors = require('cors');
require('dotenv').config();

// const uploadRoutes = require('./routes/upload');
// STEP 6: Added the new guest routes
const guestRoutes = require('./routes/guestRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const hostRoutes = require('./routes/hostRoutes');
const ocrRoutes = require('./routes/ocrRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Debug logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Routes
// app.use('/api/v1', uploadRoutes);
// Authentication routes
app.use('/api/auth', hostRoutes);
// OCR routes
app.use('/api/ocr', ocrRoutes);
// STEP 6: Connected the guest routes to the /api/guests path
app.use('/api/guests', guestRoutes);
app.use('/api/ledger', ledgerRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'active', timestamp: new Date() });
});

if (require.main === module) {
    app.listen(PORT, async () => {
        console.log(`🚀 HostShield API running on port ${PORT}`);

        // Ensure upload directory exists
        const { ensureUploadDir, cleanupOldFiles } = require('./services/storageService');
        await ensureUploadDir();

        // Schedule cleanup job (every 1 hour)
        setInterval(async () => {
            console.log('Running scheduled file cleanup...');
            await cleanupOldFiles();
        }, 60 * 60 * 1000);

        // Start Government Submission Scheduler
        const SchedulerService = require('./services/schedulerService');
        SchedulerService.start();
    });
}

module.exports = app;