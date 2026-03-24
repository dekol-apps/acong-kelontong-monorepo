import { Types } from 'mongoose';
import { sanitizeObject } from './sanitizer';

describe('Sanitizer', () => {
  it('should sanitize nested objects and arrays of ObjectIds', () => {
    const input = {
      movement_type: 'OUT',
      items: [
        {
          product: '507f1f77bcf86cd799439011',
          item_qty: 10
        }
      ],
      metadata: {
        nested: {
          id: '507f1f77bcf86cd799439012'
        }
      }
    };

    const sanitized = sanitizeObject(input);

    expect(sanitized.items[0].product).toBeInstanceOf(Types.ObjectId);
    expect(sanitized.items[0].product.toString()).toBe('507f1f77bcf86cd799439011');
    expect(sanitized.metadata.nested.id).toBeInstanceOf(Types.ObjectId);
    expect(sanitized.metadata.nested.id.toString()).toBe('507f1f77bcf86cd799439012');
  });

  it('should handle deeply nested arrays', () => {
    const input = {
      layers: [
        [
          { id: '507f1f77bcf86cd799439011' }
        ]
      ]
    };

    const sanitized = sanitizeObject(input);
    expect(sanitized.layers[0][0].id).toBeInstanceOf(Types.ObjectId);
  });
});
