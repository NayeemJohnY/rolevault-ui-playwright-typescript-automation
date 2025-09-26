import * as crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key-change-me';
const IV_LENGTH = 12;
const KEY_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;

export const encrypt = (text: string): string => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.scryptSync(SECRET_KEY, 'salt', KEY_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export const decrypt = (encryptedBase64: string): string => {
    try {
        const data = Buffer.from(encryptedBase64, 'base64');
        const iv = data.subarray(0, IV_LENGTH);
        const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
        const encryptedText = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
        const key = crypto.scryptSync(SECRET_KEY, 'salt', KEY_LENGTH);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString('utf8');

    } catch (error) {
        console.error(`Decryption failed with error '${error}' for string '${encryptedBase64}'`);
        return encryptedBase64;
    }

}