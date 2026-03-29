import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derives a 32-byte key from the env variable using SHA-256.
 * Throws at startup if ENCRYPTION_KEY is not set — no silent fallback.
 */
function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      '[MindTrackEDU] ENCRYPTION_KEY environment variable is required and not set.'
    );
  }
  // SHA-256 normalises any length key to exactly 32 bytes
  return createHash('sha256').update(raw).digest();
}

// Fail fast at module load time in production
let _key: Buffer;
try {
  _key = getEncryptionKey();
} catch (e) {
  if (process.env.NODE_ENV === 'production') throw e;
  // In dev/test allow a deterministic dummy key so tests don't need env vars
  _key = createHash('sha256').update('dev-only-key-do-not-use-in-prod').digest();
  console.warn('[MindTrackEDU] WARNING: Using dev encryption key. Set ENCRYPTION_KEY in production.');
}

/**
 * Encrypts text using AES-256-GCM with a random IV.
 * Output format: base64(iv + authTag + ciphertext)
 */
export function encrypt(text: string): string {
  if (!text) return text;

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, _key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Pack: iv (16) + authTag (16) + ciphertext
  const packed = Buffer.concat([iv, authTag, encrypted]);
  return packed.toString('base64');
}

/**
 * Decrypts a base64-encoded payload produced by encrypt().
 * Throws on tampered/corrupt data instead of silently returning garbage.
 */
export function decrypt(encryptedBase64: string): string {
  if (!encryptedBase64) return encryptedBase64;

  try {
    const packed = Buffer.from(encryptedBase64, 'base64');

    if (packed.length < IV_LENGTH + TAG_LENGTH + 1) {
      throw new Error('Payload too short to be valid ciphertext.');
    }

    const iv      = packed.subarray(0, IV_LENGTH);
    const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = packed.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, _key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8');
  } catch (error) {
    // Surface the error — never silently return encrypted bytes as plain text
    throw new Error(`Decryption failed: ${(error as Error).message}`);
  }
}

/**
 * One-way SHA-256 hash (hex). Suitable for indexing encrypted fields.
 */
export function hash(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Cryptographically secure random token (hex string).
 */
export function generateToken(byteLength: number = 32): string {
  return randomBytes(byteLength).toString('hex');
}
