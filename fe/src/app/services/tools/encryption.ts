import CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

const SECRET = String(environment.FE_ENCRYPTION_KEY); // Convert to string for CryptoJS

export function encrypt(value: unknown): string {
  // put the value inside object, just in case the value is string
  const json = JSON.stringify({ __data: value });
  return CryptoJS.AES.encrypt(json, SECRET).toString();
}

export function decrypt<T = any>(encrypted: string): T | undefined {
  if (!encrypted) return undefined;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET);
    const json = bytes.toString(CryptoJS.enc.Utf8);

    if (!json) return undefined; // in case of wrong secret or corrupted data

    const parsed = JSON.parse(json);
    return parsed.__data as T;
  } catch (e) {
    console.error('Decryption failed:', e);
    return undefined;
  }
}
