const pdf = require('pdf-img-convert');
const { extractData } = require('./ocr_engine');

/**
 * HostShield PDF Handler: Converts and processes multi-page PDFs
 */
async function processDocument(filePath, mimeType) {
    if (mimeType === 'application/pdf') {
        // 1. Convert PDF pages to high-res images (300 DPI equivalent)
        const pdfArray = await pdf.convert(filePath, { width: 2000 });
        
        let allResults = [];
        for (let i = 0; i < pdfArray.length; i++) {
            // 2. Pass each page buffer to our existing OCR engine
            const pageData = await extractData(pdfArray[i]);
            allResults.push(pageData);
        }
        
        // 3. Return the best match (e.g., the page containing the MRZ or ID data)
        return consolidateResults(allResults);
    }
    
    // Standard image processing fallback
    return extractData(filePath);
}