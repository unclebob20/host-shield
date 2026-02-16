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

console.log('\n🔒 HostShield Stripe Key Encrypter');
console.log('===================================');
console.log('Using Master Key: ' + MASTER_KEY.substring(0, 8) + '...\n');

function encryptAndDisplay(label, envVarName, value) {
    if (!value || value.trim() === '') {
        console.log(`⚠️  Skipping ${label} (no value provided)\n`);
        return;
    }

    const { encrypted, iv, authTag } = encryptionService.encrypt(value.trim());
    const finalString = `enc:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;

    console.log(`✅ Encrypted ${label}:`);
    console.log('---------------------------------------------------');
    console.log(`${envVarName}=${finalString}`);
    console.log('---------------------------------------------------\n');
}

// Collect both keys
rl.question('Enter Stripe Secret Key (sk_test_... or sk_live_...): ', (secretKey) => {
    rl.question('Enter Stripe Webhook Secret (whsec_...): ', (webhookSecret) => {
        console.log('\n');

        if (secretKey && secretKey.trim()) {
            encryptAndDisplay('Secret Key', 'STRIPE_SECRET_KEY', secretKey);
        }

        if (webhookSecret && webhookSecret.trim()) {
            encryptAndDisplay('Webhook Secret', 'STRIPE_WEBHOOK_SECRET', webhookSecret);
        }

        if (!secretKey && !webhookSecret) {
            console.log('❌ No keys provided. Exiting.\n');
        } else {
            console.log('📋 Copy the above lines to your .env file on the VPS');
            console.log('   Then run: ./deploy.sh\n');
        }

        rl.close();
    });
});
