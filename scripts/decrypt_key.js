const encryptionService = require('../apps/api-server/src/services/encryptionService.js');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Read from environment or use the one from .env
const MASTER_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY || '211f27e27307a7968bb69b767807adb78120c24f47dd51a7675fefada59eea94';

// Mock the environment so the service picks it up
process.env.CREDENTIAL_ENCRYPTION_KEY = MASTER_KEY;
encryptionService.encryptionKey = MASTER_KEY;

console.log('\n🔓 HostShield Key Decrypter');
console.log('===========================');
console.log('Using Master Key: ' + MASTER_KEY.substring(0, 8) + '...\n');

rl.question('Enter encrypted value (enc:iv:authTag:data): ', (encryptedValue) => {
    if (!encryptedValue || !encryptedValue.trim()) {
        console.log('❌ No value provided.\n');
        rl.close();
        return;
    }

    const trimmed = encryptedValue.trim();

    // Check format
    if (!trimmed.startsWith('enc:')) {
        console.log('❌ Invalid format. Expected: enc:iv:authTag:encryptedData\n');
        rl.close();
        return;
    }

    try {
        // Parse the encrypted string
        const parts = trimmed.split(':');
        if (parts.length !== 4) {
            console.log('❌ Invalid format. Expected 4 parts separated by colons.\n');
            rl.close();
            return;
        }

        const iv = Buffer.from(parts[1], 'hex');
        const authTag = Buffer.from(parts[2], 'hex');
        const encrypted = Buffer.from(parts[3], 'hex');

        // Decrypt
        const decrypted = encryptionService.decrypt(encrypted, iv, authTag);
        const plaintext = decrypted.toString('utf8');

        console.log('\n✅ Decrypted Value:');
        console.log('---------------------------------------------------');
        console.log(plaintext);
        console.log('---------------------------------------------------\n');

    } catch (error) {
        console.log('❌ Decryption failed:', error.message);
        console.log('   Make sure you\'re using the correct encryption key.\n');
    }

    rl.close();
});
