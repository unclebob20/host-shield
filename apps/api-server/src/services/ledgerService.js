const PDFDocument = require('pdfkit');
const { query } = require('./db');

async function fetchHost(hostId) {
  const { rows } = await query(
    `select id, email, full_name, police_provider_id, created_at
     from hosts
     where id = $1`,
    [hostId]
  );
  return rows[0] || null;
}

async function fetchGuests(hostId, fromDate, toDate) {
  const { rows } = await query(
    `select
        id,
        first_name,
        last_name,
        date_of_birth,
        nationality_iso3,
        document_type,
        document_number,
        arrival_date,
        departure_date,
        purpose_of_stay,
        gov_submission_id,
        submission_status,
        submitted_at,
        created_at
     from guest_register
     where host_id = $1
       and arrival_date >= $2::date
       and arrival_date <= $3::date
     order by arrival_date asc, last_name asc, first_name asc`,
    [hostId, fromDate, toDate]
  );
  return rows;
}

async function writeAudit(hostId, details) {
  // We log as a host-level action without a guest_id to keep it simple for now.
  // (Schema is guest_id FK; we can add a separate host audit table later if needed.)
  // For now: attach to the most recent guest in range when available.
  const guestId = details.guest_id || null;
  if (!guestId) return;

  await query(
    `insert into compliance_audit_log (guest_id, action_type, action_details)
     values ($1, $2, $3::jsonb)`,
    [guestId, 'LEDGER_EXPORT', JSON.stringify(details)]
  );
}

function buildLedgerPdf({ host, fromDate, toDate, guests }) {
  const doc = new PDFDocument({ size: 'A4', margin: 36 });

  const title = 'Kniha ubytovaných (Guest Register)';
  doc.fontSize(16).text(title, { align: 'center' });
  doc.moveDown(0.5);

  doc.fontSize(10);
  doc.text(`Host: ${host.full_name} (${host.email})`);
  if (host.police_provider_id) doc.text(`Police provider ID: ${host.police_provider_id}`);
  doc.text(`Range: ${fromDate} → ${toDate}`);
  doc.text(`Generated: ${new Date().toISOString()}`);
  doc.moveDown(1);

  // Simple table header
  const headers = [
    'Arrival',
    'Departure',
    'Name',
    'DOB',
    'Nat.',
    'Doc',
    'Doc No.',
    'Status'
  ];

  const colWidths = [55, 60, 120, 60, 35, 45, 90, 55];
  const startX = doc.x;
  let y = doc.y;

  function drawRow(values, isHeader = false) {
    let x = startX;
    doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
    values.forEach((v, i) => {
      doc.text(String(v ?? ''), x, y, { width: colWidths[i], ellipsis: true });
      x += colWidths[i];
    });
    y += 14;
    doc.y = y;
  }

  drawRow(headers, true);
  doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y).stroke();
  y += 6;
  doc.y = y;

  for (const g of guests) {
    if (y > doc.page.height - doc.page.margins.bottom - 40) {
      doc.addPage();
      y = doc.y;
      drawRow(headers, true);
      doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y).stroke();
      y += 6;
      doc.y = y;
    }

    drawRow([
      g.arrival_date?.toISOString?.().slice(0, 10) || g.arrival_date,
      g.departure_date?.toISOString?.().slice(0, 10) || g.departure_date,
      `${g.last_name} ${g.first_name}`,
      g.date_of_birth?.toISOString?.().slice(0, 10) || g.date_of_birth,
      g.nationality_iso3,
      g.document_type,
      g.document_number,
      g.submission_status || 'pending'
    ]);
  }

  doc.moveDown(1);
  doc.fontSize(9).font('Helvetica').text(`Total guests: ${guests.length}`);

  return doc;
}

module.exports = {
  fetchHost,
  fetchGuests,
  writeAudit,
  buildLedgerPdf
};

