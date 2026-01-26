const mrz = require('mrz');

/**
 * Document Parser Service - Powered by 'mrz' library
 * 
 * This service extracts MRZ lines from OCR text and uses the official 'mrz' library
 * to parse and validate the data according to ICAO 9303 standards.
 */

function parseExtraction(ocrResult) {
    const { text } = ocrResult;

    // 1. Filter potential MRZ lines
    const rawLines = text.split('\n');
    const candidates = rawLines.map(l => l.trim().toUpperCase().replace(/\s/g, ''))
        .filter(l => l.length >= 28 && (l.includes('<<') || /^[PIAC]<.*/.test(l) || /^[PIAC][A-Z]{3}/.test(l)));

    if (candidates.length < 2) {
        return {
            success: false,
            error: "No valid MRZ lines found. Please ensure the machine-readable zone is clear."
        };
    }

    // 2. Try to parse combinations with Auto-Repair
    const combinations = [
        candidates.slice(-2), // TD2/TD3 (2 lines)
        candidates.slice(-3)  // TD1 (3 lines)
    ];

    for (const lines of combinations) {
        try {
            // Repair lines before passing to strict parser
            const repaired = lines.map(line => repairMrzLine(line));

            console.log('=== REPAIRED MRZ ===');
            repaired.forEach((l, i) => console.log(`Line ${i + 1}: ${l}`));
            console.log('=== END REPAIRED ===');

            const result = mrz.parse(repaired);

            // Accept if valid OR if it passed partial parsing
            if (result.valid ||
                (result.fields && result.fields.lastName && result.fields.documentNumber)) {
                return mapMrzToData(result);
            }
        } catch (e) {
            console.log('Parse error:', e.message);
        }
    }

    return {
        success: false,
        error: "MRZ found but parsing failed (checksum or format invalid)."
    };
}

function repairMrzLine(line) {
    let clean = line.replace(/[^A-Z0-9<]/g, '');

    // TD3 Line 1 Repair
    if (clean.startsWith('P') || clean.startsWith('I') || clean.startsWith('A')) {
        // Fix 1: PC/IC/AC at start -> P</I</A< (first separator misread as C)
        if (clean.match(/^PC/)) {
            clean = 'P<' + clean.substring(2);
        } else if (clean.match(/^IC/)) {
            clean = 'I<' + clean.substring(2);
        } else if (clean.match(/^AC/)) {
            clean = 'A<' + clean.substring(2);
        }

        // Fix 2: Replace double separator patterns
        clean = clean.replace(/KK/g, '<<').replace(/LL/g, '<<').replace(/KL/g, '<<').replace(/LK/g, '<<');
        clean = clean.replace(/CC/g, '<<').replace(/CK/g, '<<').replace(/KC/g, '<<'); // C is also misread <

        // Fix 3: Replace <K and <C patterns (isolated misread after <)
        clean = clean.replace(/<K/g, '<<').replace(/<C/g, '<<');

        // Fix 4: If no << found, try to upgrade first single <
        if (!clean.includes('<<') && clean.length > 10) {
            const countryEndIndex = 5;
            const firstSingle = clean.indexOf('<', countryEndIndex);
            if (firstSingle !== -1) {
                clean = clean.slice(0, firstSingle) + '<' + clean.slice(firstSingle);
            }
        }
    }

    // TD3 length fix
    if (clean.length === 43) clean += '<';
    if (clean.length > 44) clean = clean.substring(0, 44);

    return clean;
}

function cleanName(raw) {
    if (!raw) return null;
    let clean = raw.toUpperCase();

    // Remove K/L sequences
    clean = clean.replace(/[KL]{3,}/g, '');
    clean = clean.replace(/[KL]+$/, '');
    clean = clean.replace(/\s[KL]\s/g, ' ');

    return clean.trim();
}

function mapMrzToData(parsed) {
    const f = parsed.fields;

    let firstName = f.firstName;
    let lastName = f.lastName;

    // Fallback: If MRZ missed the << separator, split manually
    if ((!firstName || firstName.length === 0) && lastName && /\s/.test(lastName)) {
        const parts = lastName.trim().split(/\s+/);
        if (parts.length >= 2) {
            let potentialFirst = parts.pop();
            const potentialLast = parts.join(' ');

            // Fix "KIVAN" -> "IVAN"
            if (potentialFirst.startsWith('K') && potentialFirst.length > 3) {
                potentialFirst = potentialFirst.substring(1);
            }

            firstName = potentialFirst;
            lastName = potentialLast;
        }
    }

    return {
        first_name: cleanName(firstName),
        last_name: cleanName(lastName),
        nationality_iso3: f.nationality,
        document_number: f.documentNumber,
        document_type: f.documentCode && f.documentCode.startsWith('P') ? 'PASSPORT' : 'ID_CARD',
        date_of_birth: smartDate(f.birthDate)
    };
}

function smartDate(yymmdd) {
    if (!yymmdd || yymmdd.length !== 6) return null;
    const year = parseInt(yymmdd.substring(0, 2));
    const currentYear = new Date().getFullYear() % 100;
    const century = year > currentYear ? '19' : '20';

    return `${century}${yymmdd.substring(0, 2)}-${yymmdd.substring(2, 4)}-${yymmdd.substring(4, 6)}`;
}

module.exports = { parseExtraction };
