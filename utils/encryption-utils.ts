/**
 * Encryption utilities for secure handling of sensitive test data.
 * Uses AES-256-GCM encryption for strong security with authentication.
 */

import * as crypto from 'crypto';

/** AES-256-GCM encryption algorithm identifier */
const ALGORITHM = 'aes-256-gcm';

/** Secret key for encryption, sourced from environment or default fallback */
const SECRET_KEY = process.env.ENCRYPTION_KEY;

/** Length of initialization vector in bytes */
const IV_LENGTH = 12;

/** Length of encryption key in bytes */
const KEY_LENGTH = 32;

/** Length of authentication tag in bytes */
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a plain text string using AES-256-GCM encryption.
 *
 * @param text - The plain text string to encrypt
 * @returns Base64-encoded encrypted string containing IV, auth tag, and encrypted data
 *
 * @example
 * ```typescript
 * const encrypted = encrypt('sensitive-password');
 * console.log(encrypted); // Returns base64 encoded encrypted string
 * ```
 */
export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.scryptSync(SECRET_KEY!, 'salt', KEY_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
};

/**
 * Decrypts a base64-encoded encrypted string using AES-256-GCM.
 *
 * @param encryptedBase64 - Base64-encoded encrypted string from encrypt function
 * @returns Decrypted plain text string, or original string if decryption fails
 *
 * @example
 * ```typescript
 * const decrypted = decrypt(encryptedString);
 * console.log(decrypted); // Returns original plain text
 * ```
 */
export const decrypt = (encryptedBase64: string): string => {
  try {
    const data = Buffer.from(encryptedBase64, 'base64');
    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encryptedText = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const key = crypto.scryptSync(SECRET_KEY!, 'salt', KEY_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error(`Decryption failed with error '${error}' for string '${encryptedBase64}'`);
    return encryptedBase64;
  }
};
