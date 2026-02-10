const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const crypto = require('crypto');
const execAsync = util.promisify(exec);

class GovCredentialsService {
    constructor() {
        // Directory visible to both API Server and Gov-Bridge (via Docker volume)
        // Check env var -> Docker standard path -> Local dev path (fallback)
        this.sharedKeystoreDir = process.env.GOV_KEYSTORE_DIR;

        if (!this.sharedKeystoreDir) {
            if (fs.existsSync('/app/security/hosts')) {
                this.sharedKeystoreDir = '/app/security/hosts';
            } else {
                this.sharedKeystoreDir = path.join(__dirname, '../../../../security/hosts');
            }
        }

        console.log(`[GovCredentials] Using keystore directory: ${this.sharedKeystoreDir}`);

        // The standardized password the Bridge expects for all keystores
        // TODO: Verify if the Bridge image has a specific default or if this connects to bridge config
        this.bridgeKeystorePassword = process.env.BRIDGE_KEYSTORE_PASSWORD || 'changeit';
    }

    /**
     * Normalizes a user's uploaded P12 keystore for the Gov-Bridge.
     * Decrypts with user's password -> Re-encrypts with Bridge's password -> Saves to shared volume.
     * 
     * @param {string} hostId - The internal Host ID (UUID)
     * @param {string} subjectId - The ICO or Subject ID (used for filename)
     * @param {Buffer} p12Buffer - The raw uploaded .p12 file
     * @param {string} userPassword - The password to unlock the user's .p12
     * @returns {Promise<string>} Path to the saved file (symlink path for compatibility)
     */
    async saveHostKeystore(hostId, subjectId, p12Buffer, userPassword) {
        if (!hostId) throw new Error('Host ID is required');
        if (!subjectId) throw new Error('Subject ID is required');
        if (!p12Buffer) throw new Error('Keystore file is required');
        if (!userPassword) throw new Error('Keystore password is required');

        // Check for required Salts
        const ksSalt = process.env.UPVS_KS_SALT;
        const pkSalt = process.env.UPVS_PK_SALT;
        if (!ksSalt || !pkSalt) {
            throw new Error('Missing UPVS_KS_SALT or UPVS_PK_SALT environment variables. Cannot generate compatible keystore.');
        }

        // Helper to generate password: SHA1(salt:sub)
        const generatePass = (salt, sub) => {
            return crypto.createHash('sha1').update(`${salt}:${sub}`).digest('hex');
        };

        const keystorePass = generatePass(ksSalt, subjectId);
        const keyPass = generatePass(pkSalt, subjectId);

        // Ensure root output directory exists
        if (!fs.existsSync(this.sharedKeystoreDir)) {
            fs.mkdirSync(this.sharedKeystoreDir, { recursive: true });
        }

        // Create per-host directory
        const hostDir = path.join(this.sharedKeystoreDir, hostId);
        if (!fs.existsSync(hostDir)) {
            fs.mkdirSync(hostDir, { recursive: true });
        }

        const tempId = Date.now().toString();
        const inputPath = path.join(hostDir, `temp_${tempId}_in.p12`);
        // Final JKS file path inside the HOST directory
        // Bridge expects: <SUB>_prod.keystore
        const finalFilename = `${subjectId}_prod.keystore`;
        const finalHostPath = path.join(hostDir, finalFilename);

        // Symlink path in the ROOT directory
        const symlinkPath = path.join(this.sharedKeystoreDir, finalFilename);

        try {
            // 1. Write raw input to temp file
            fs.writeFileSync(inputPath, p12Buffer);

            // 2. Convert to JKS using keytool
            // We use keytool because openssl cannot create JKS easily without external tools? 
            // Actually, we can just use keytool importkeystore.

            // Wait, keytool requires the SOURCE P12 to be readable.
            // Command: keytool -importkeystore -srckeystore input.p12 -srcstoretype pkcs12 -srcstorepass userPass 
            //          -destkeystore output.jks -deststoretype jks -deststorepass ksPass -destkeypass keyPass 
            //          -alias subjectId (if we know source alias?) or -srcalias ...

            // Problem: We don't know the SOURCE alias inside user's P12.
            // But we can rename alias during import using -destalias.
            // AND we can change the password.

            // HOWEVER, we must know the SOURCE alias to select it?
            // Usually P12 has only one key. keytool might pick default?
            // If checking source alias is hard, maybe we convert to PEM first with openssl (stripping password), then to P12 (with known alias), then to JKS.
            // Let's stick to the previous PEM flow but end with JKS.

            const tempPemPath = path.join(hostDir, `temp_${tempId}.pem`);
            const tempP12Path = path.join(hostDir, `temp_${tempId}.p12`);

            // 2.a Convert User P12 -> Unencrypted PEM
            await execAsync(`openssl pkcs12 -in "${inputPath}" -nodes -passin pass:"${userPassword}" -out "${tempPemPath}" -legacy`);

            // 2.b Convert PEM -> Intermediate P12 (with new alias and key password)
            // We set the key password here equal to the destination key password
            // Note: P12 doesn't technically support separate Key password vs Store password well, but we set export pass.
            await execAsync(`openssl pkcs12 -export -in "${tempPemPath}" -out "${tempP12Path}" -passout pass:"${keystorePass}" -name "${subjectId}"`);

            // 2.c Convert Intermediate P12 -> JKS
            // We use the same password for store and key to simplify P12 import, then change if needed?
            // Bridge requires:
            // StorePass = SHA1(KS_SALT:SUB)
            // KeyPass = SHA1(PK_SALT:SUB)

            // keytool -importkeystore ...
            // Validating keytool presence
            try {
                await execAsync('keytool -help');
            } catch (e) {
                throw new Error('keytool is not available. Please install OpenJDK in Dockerfile.');
            }

            const keytoolCmd = `keytool -importkeystore \\
                -srckeystore "${tempP12Path}" -srcstoretype pkcs12 -srcstorepass "${keystorePass}" \\
                -destkeystore "${finalHostPath}" -deststoretype jks -deststorepass "${keystorePass}" \\
                -alias "${subjectId}" -destalias "${subjectId}" \\
                -noprompt`;

            // Note: We are setting DEST KEY PASS same as STORE PASS initially?
            // If Bridge requires different Key Password, we must change it.
            // keytool -keypasswd -alias ...

            await execAsync(keytoolCmd);

            // 2.d Change Key Password if it differs from Store Password
            if (keystorePass !== keyPass) {
                await execAsync(`keytool -keypasswd -alias "${subjectId}" -keystore "${finalHostPath}" -storepass "${keystorePass}" -new "${keyPass}" -keypass "${keystorePass}"`);
            }

            // 3. Create Symlink for Bridge Compatibility
            if (fs.existsSync(symlinkPath)) {
                fs.unlinkSync(symlinkPath);
            }
            const relativeTarget = path.join(hostId, finalFilename);
            fs.symlinkSync(relativeTarget, symlinkPath);

            console.log(`[GovCredentials] Successfully normalized JKS keystore for ${subjectId} in ${hostDir}`);
            console.log(`[GovCredentials] Created compatibility symlink at ${symlinkPath}`);

            return symlinkPath;
        } catch (error) {
            console.error('[GovCredentials] Error processing keystore:', error);
            if (fs.existsSync(finalHostPath)) fs.unlinkSync(finalHostPath);
            if (fs.existsSync(symlinkPath)) fs.unlinkSync(symlinkPath);
            throw new Error(`Failed to process keystore: ${error.message}`);
        } finally {
            // Cleanup temps
            const tempPemPath = path.join(hostDir, `temp_${tempId}.pem`);
            const tempP12Path = path.join(hostDir, `temp_${tempId}.p12`);
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(tempPemPath)) fs.unlinkSync(tempPemPath);
            if (fs.existsSync(tempP12Path)) fs.unlinkSync(tempP12Path);
        }
    }

    /**
     * List all registered subjects (tenants) currently available to the Bridge
     */
    listRegisteredSubjects() {
        if (!fs.existsSync(this.sharedKeystoreDir)) return [];
        return fs.readdirSync(this.sharedKeystoreDir)
            .filter(f => f.endsWith('.p12') || f.endsWith('.jks'))
            .map(f => f.replace(/\.(p12|jks)$/, ''));
    }
}

module.exports = new GovCredentialsService();
