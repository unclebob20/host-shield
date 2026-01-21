const express = require('express');
const { exportLedgerPdf, previewLedger } = require('../controllers/ledgerController');

const router = express.Router();

// Sprint 2: Kniha ubytovaných JSON preview
// Body: { hostId: UUID, fromDate: 'YYYY-MM-DD', toDate: 'YYYY-MM-DD' }
router.post('/preview', previewLedger);

// Sprint 2: Kniha ubytovaných export (PDF)
// Body: { hostId: UUID, fromDate: 'YYYY-MM-DD', toDate: 'YYYY-MM-DD' }
router.post('/export', exportLedgerPdf);

module.exports = router;

