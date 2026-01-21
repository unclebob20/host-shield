const express = require('express');
const cors = require('cors');
require('dotenv').config();

// const uploadRoutes = require('./routes/upload');
// STEP 6: Added the new guest routes
const guestRoutes = require('./routes/guestRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// app.use('/api/v1', uploadRoutes);
// STEP 6: Connected the guest routes to the /api/guests path
app.use('/api/guests', guestRoutes);
app.use('/api/ledger', ledgerRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'active', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`🚀 HostShield API running on port ${PORT}`);
});