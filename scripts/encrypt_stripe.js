const encryptionService = require('../apps/api-server/src/services/encryptionService.js');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Hardcoded for your convenience from your .env
const MASTER_KEY = '211f27e27307a7968bb69b767807adb78120c24f47dd51a7675fefada59eea94';

// Mock the environment so the service picks it up
process.env.CREDENTIAL_ENCRYPTION_KEY = MASTER_KEY;
// The service usually reads from process.env in constructor, but let's be safe
// We need to re-instantiate or just use the static logic if available, 
// but encryptionService is a singleton instance. 
// We will manually inject the key if needed, but since we set process.env before require/usage, it should work if we re-require or if we trust the singleton initialization order.
// Actually, in the provided code, constructor reads process.env.
// But we need to make sure we create a new instance or set the property.

// Let's just create a fresh instance workflow to be 100% sure we use the key
encryptionService.encryptionKey = MASTER_KEY;

console.log('\n🔒 HostShield Credential Encrypter');
console.log('==================================');
console.log('Using Master Key: ' + MASTER_KEY.substring(0, 8) + '...');

rl.question('\nEnter the Stripe Secret Key (sk_test_...): ', (secret) => {
    if (!secret) {
        console.log('No input provided.');
        rl.close();
        return;
    }

    const { encrypted, iv, authTag } = encryptionService.encrypt(secret);

    // Format: enc:iv:authTag:encryptedData
    const finalString = `enc:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;

    console.log('\n✅ Encrypted Value (Copy this to your server .env):');
    console.log('---------------------------------------------------');
    console.log(`STRIPE_SECRET_KEY=${finalString}`);
    console.log('---------------------------------------------------');

    rl.close();
});
