const { extractDataFromSVK } = require('../src/services/ocr_engine');

const TEST_CASES = [
    {
        file: './samples/sample_svk_id.jpg',
        expected: { lastName: 'NOVÁK', docNumber: 'EB123456' }
    }
];

async function runTests() {
    console.log("--- HostShield Compliance Test ---");
    for (const test of TEST_CASES) {
        const result = await extractDataFromSVK(test.file);
        const success = result.lastName === test.expected.lastName;
        console.log(`${test.file}: ${success ? 'PASSED' : 'FAILED'}`);
    }
}

runTests();