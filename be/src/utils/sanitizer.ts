import { Types } from 'mongoose';

export function sanitizeValue(value: any): any {
  if (value === 'undefined') return undefined;
  if (value === 'null') return null;
  if (value === '') return undefined; // optional: drop empty strings

  // Transform valid ObjectId strings back to ObjectId instances
  if (typeof value === 'string' && Types.ObjectId.isValid(value) && String(new Types.ObjectId(value)) === value) {
    return new Types.ObjectId(value);
  }

  return value;
}

export function sanitizeObject(obj: any): any {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      if (item && typeof item === 'string') {
        obj[index] = sanitizeValue(item);
      } else {
        sanitizeObject(item);
      }
    });
    return obj;
  }

  if (obj && typeof obj === 'object' && !(obj instanceof Types.ObjectId)) {
    Object.keys(obj).forEach((key) => {
      const val = sanitizeValue(obj[key]);
      if (val && typeof val === 'object' && !(val instanceof Types.ObjectId)) {
        obj[key] = sanitizeObject(val);
      } else {
        obj[key] = val;
      }
    });
  }
  return obj;
}
