import { randomBytes, createHash } from "crypto";
import CryptoJS from 'crypto-js';
import { Types } from 'mongoose';
import Decimal from 'decimal.js';

export function encrypt(value: unknown): string {
  // put the value inside object, just in case the value is string
  const json = JSON.stringify({ __data: value });
  return CryptoJS.AES.encrypt(json, process.env.JWT_SECRET).toString() as string;
}

export function decrypt<T = any>(encrypted: string): T | undefined {
  if (!encrypted) return undefined;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, process.env.JWT_SECRET);
    const json = bytes.toString(CryptoJS.enc.Utf8);

    if (!json) return undefined; // in case of wrong secret or corrupted data

    const parsed = JSON.parse(json);
    return parsed.__data as T;
  } catch (e) {
    console.error('Decryption failed:', e);
    return undefined;
  }
}


export const generateRandomToken = (): string => {
  return randomBytes(32).toString("hex");
};

export function sha256Base64(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('base64'); // or 'hex'
}

// encode
export function encodeBase64(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64');
}

// decode (revert back)
export function decodeBase64(base64: string): string {
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function decreaseDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export function toNumber(text: any): number {
  return Number(text || 0)
}

export function digitShortDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(',', '');
}

export const toDecimal = (val: Types.Decimal128) =>
  new Decimal(val.toString());

export const toDecimal128 = (val: Decimal) =>
  Types.Decimal128.fromString(val.toFixed(0)); // Rupiah rounding

export function addDecimal(a?: Types.Decimal128, b?: Types.Decimal128) {
  if (!a || !b) return undefined;
  const result = new Decimal(a.toString()).plus(new Decimal(b.toString()));
  return Types.Decimal128.fromString(result.toFixed());
}

export function subtractDecimal(a?: Types.Decimal128, b?: Types.Decimal128) {
  if (!a || !b) return undefined;
  const result = new Decimal(a.toString()).minus(new Decimal(b.toString()));
  return Types.Decimal128.fromString(result.toFixed());
}