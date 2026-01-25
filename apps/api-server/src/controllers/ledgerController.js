const { fetchHost, fetchGuests, writeAudit, buildLedgerPdf } = require('../services/ledgerService');

function requireIsoDate(value, fieldName) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${fieldName} must be YYYY-MM-DD`);
  }
  return value;
}

exports.exportLedgerPdf = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body || {};

    // hostId comes from authenticated user (req.authenticatedHost is set by requireAuth middleware)
    const hostId = req.authenticatedHost.id;

    const from = requireIsoDate(fromDate, 'fromDate');
    const to = requireIsoDate(toDate, 'toDate');

    const host = await fetchHost(hostId);
    if (!host) return res.status(404).json({ success: false, error: 'Host not found' });

    const guests = await fetchGuests(hostId, from, to);

    // Best-effort audit log: attach to the first guest in the export (schema requires guest_id).
    if (guests[0]?.id) {
      await writeAudit(hostId, {
        guest_id: guests[0].id,
        host_id: hostId,
        range: { from, to },
        count: guests.length
      });
    }

    const doc = buildLedgerPdf({ host, fromDate: from, toDate: to, guests });
    const filename = `kniha-ubytovanych_${hostId}_${from}_${to}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// JSON preview of ledger entries before generating PDF.
// Body: { fromDate: 'YYYY-MM-DD', toDate: 'YYYY-MM-DD' }
exports.previewLedger = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body || {};

    // hostId comes from authenticated user (req.authenticatedHost is set by requireAuth middleware)
    const hostId = req.authenticatedHost.id;

    const from = requireIsoDate(fromDate, 'fromDate');
    const to = requireIsoDate(toDate, 'toDate');

    const host = await fetchHost(hostId);
    if (!host) return res.status(404).json({ success: false, error: 'Host not found' });

    const guests = await fetchGuests(hostId, from, to);

    res.status(200).json({
      success: true,
      host: {
        id: host.id,
        full_name: host.full_name,
        email: host.email,
        police_provider_id: host.police_provider_id
      },
      range: { from, to },
      count: guests.length,
      entries: guests
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

