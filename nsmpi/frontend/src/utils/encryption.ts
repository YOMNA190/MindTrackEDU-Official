import { KeyPair, EncryptedMessage } from '@/types';

/**
 * End-to-End Encryption Utilities
 * Uses Web Crypto API for RSA-OAEP and AES-GCM encryption
 */

const RSA_KEY_SIZE = 2048;
const AES_KEY_SIZE = 256;

/**
 * Generate RSA key pair for user
 */
export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: RSA_KEY_SIZE,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );

  const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKey: arrayBufferToBase64(publicKey),
    privateKey: arrayBufferToBase64(privateKey),
  };
}

/**
 * Import public key from base64 string
 */
export async function importPublicKey(base64PublicKey: string): Promise<CryptoKey> {
  const publicKeyBuffer = base64ToArrayBuffer(base64PublicKey);

  return window.crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );
}

/**
 * Import private key from base64 string
 */
export async function importPrivateKey(base64PrivateKey: string): Promise<CryptoKey> {
  const privateKeyBuffer = base64ToArrayBuffer(base64PrivateKey);

  return window.crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['decrypt']
  );
}

/**
 * Generate AES key for message encryption
 */
export async function generateAESKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: AES_KEY_SIZE,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt message with AES-GCM
 */
export async function encryptMessage(
  message: string,
  aesKey: CryptoKey
): Promise<{ encryptedContent: string; iv: string }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const messageBuffer = encoder.encode(message);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    aesKey,
    messageBuffer
  );

  return {
    encryptedContent: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv),
  };
}

/**
 * Decrypt message with AES-GCM
 */
export async function decryptMessage(
  encryptedContent: string,
  iv: string,
  aesKey: CryptoKey
): Promise<string> {
  const encryptedBuffer = base64ToArrayBuffer(encryptedContent);
  const ivBuffer = base64ToArrayBuffer(iv);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    aesKey,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Encrypt AES key with RSA public key
 */
export async function encryptAESKey(
  aesKey: CryptoKey,
  publicKey: CryptoKey
): Promise<string> {
  const exportedKey = await window.crypto.subtle.exportKey('raw', aesKey);
  const encryptedKey = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    exportedKey
  );

  return arrayBufferToBase64(encryptedKey);
}

/**
 * Decrypt AES key with RSA private key
 */
export async function decryptAESKey(
  encryptedKey: string,
  privateKey: CryptoKey
): Promise<CryptoKey> {
  const encryptedKeyBuffer = base64ToArrayBuffer(encryptedKey);

  const decryptedKeyBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    privateKey,
    encryptedKeyBuffer
  );

  return window.crypto.subtle.importKey(
    'raw',
    decryptedKeyBuffer,
    {
      name: 'AES-GCM',
      length: AES_KEY_SIZE,
    },
    false,
    ['decrypt']
  );
}

/**
 * Full encryption flow: encrypt message and AES key
 */
export async function encryptMessageForRecipient(
  message: string,
  recipientPublicKeyBase64: string
): Promise<EncryptedMessage> {
  // Generate AES key
  const aesKey = await generateAESKey();

  // Encrypt message with AES
  const { encryptedContent, iv } = await encryptMessage(message, aesKey);

  // Import recipient's public key
  const recipientPublicKey = await importPublicKey(recipientPublicKeyBase64);

  // Encrypt AES key with recipient's public key
  const encryptedKey = await encryptAESKey(aesKey, recipientPublicKey);

  return {
    encryptedContent,
    encryptedKey,
    iv,
  };
}

/**
 * Full decryption flow: decrypt message using AES key
 */
export async function decryptMessageFromSender(
  encryptedMessage: EncryptedMessage,
  recipientPrivateKeyBase64: string
): Promise<string> {
  // Import recipient's private key
  const recipientPrivateKey = await importPrivateKey(recipientPrivateKeyBase64);

  // Decrypt AES key
  const aesKey = await decryptAESKey(encryptedMessage.encryptedKey, recipientPrivateKey);

  // Decrypt message
  return decryptMessage(
    encryptedMessage.encryptedContent,
    encryptedMessage.iv,
    aesKey
  );
}

/**
 * Store private key securely (encrypted with user's password)
 */
export async function encryptPrivateKey(
  privateKeyBase64: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Derive key from password using PBKDF2
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64);

  const encryptedPrivateKey = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    derivedKey,
    privateKeyBuffer
  );

  // Combine salt + iv + encrypted key
  const result = new Uint8Array(salt.length + iv.length + encryptedPrivateKey.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encryptedPrivateKey), salt.length + iv.length);

  return arrayBufferToBase64(result);
}

/**
 * Decrypt private key using password
 */
export async function decryptPrivateKey(
  encryptedPrivateKeyBase64: string,
  password: string
): Promise<string> {
  const encryptedData = base64ToArrayBuffer(encryptedPrivateKeyBase64);
  const salt = encryptedData.slice(0, 16);
  const iv = encryptedData.slice(16, 28);
  const encryptedKey = encryptedData.slice(28);

  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decryptedKey = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    derivedKey,
    encryptedKey
  );

  return arrayBufferToBase64(decryptedKey);
}

/**
 * Utility: Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Utility: Convert Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Check if Web Crypto API is available
 */
export function isCryptoSupported(): boolean {
  return !!(window.crypto && window.crypto.subtle);
}

/**
 * Generate a secure random string (for session IDs, etc.)
 */
export function generateSecureId(length: number = 32): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export default {
  generateKeyPair,
  importPublicKey,
  importPrivateKey,
  generateAESKey,
  encryptMessage,
  decryptMessage,
  encryptAESKey,
  decryptAESKey,
  encryptMessageForRecipient,
  decryptMessageFromSender,
  encryptPrivateKey,
  decryptPrivateKey,
  isCryptoSupported,
  generateSecureId,
};
