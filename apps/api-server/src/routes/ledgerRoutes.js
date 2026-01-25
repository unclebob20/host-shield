const express = require('express');
const { exportLedgerPdf, previewLedger } = require('../controllers/ledgerController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// All ledger routes require authentication
router.use(requireAuth);

// Sprint 2: Kniha ubytovaných JSON preview
// Body: { fromDate: 'YYYY-MM-DD', toDate: 'YYYY-MM-DD' }
router.post('/preview', previewLedger);

// Sprint 2: Kniha ubytovaných export (PDF)
// Body: { fromDate: 'YYYY-MM-DD', toDate: 'YYYY-MM-DD' }
router.post('/export', exportLedgerPdf);

module.exports = router;

