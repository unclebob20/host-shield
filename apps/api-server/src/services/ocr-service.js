/**
 * HostShield Vision AI: Supports both EU IDs and International Passports
 */
async function extractData(imagePath) {
    const worker = await createWorker(['slk', 'eng']);
    const { data: { text } } = await worker.recognize(imagePath);

    // 1. Detect Passport MRZ (Two lines of 44 characters at the bottom)
    const mrzMatch = text.match(/([A-Z0-9<]{44})\n([A-Z0-9<]{44})/);
    
    if (mrzMatch) {
        return parseMRZ(mrzMatch[0]);
    }

    // 2. Fallback to Slovak/EU ID Regex (our previous logic)
    return {
        lastName: text.match(/(?:Priezvisko|Surname)\s+([A-Z]+)/i)?.[1],
        firstName: text.match(/(?:Meno|Given names)\s+([A-Z]+)/i)?.[1],
        docNumber: text.match(/[A-Z]{2}\d{6}/)?.[0],
        dob: text.match(/\d{2}\.\d{2}\.\d{4}/)?.[0]
    };
}

function parseMRZ(mrzText) {
    // Simple logic to clean the '<<<<' and extract data from Passport MRZ format
    const lines = mrzText.split('\n');
    return {
        docType: 'P',
        nationality: lines[0].substring(2, 5),
        lastName: lines[0].substring(5).split('<<')[0].replace(/</g, ' '),
        docNumber: lines[1].substring(0, 9).replace(/</g, ''),
        dob: lines[1].substring(13, 19) // YYMMDD format
    };
}