import Decimal from 'decimal.js';
import { Schema, Types } from 'mongoose';
import { MONEY_SCALE } from 'src/utils/helper';

function normalizeMoneyDecimal128(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return value;

  const raw = value instanceof Types.Decimal128 ? value.toString() : String(value);
  const rounded = new Decimal(raw).toDecimalPlaces(MONEY_SCALE, Decimal.ROUND_HALF_UP);
  return Types.Decimal128.fromString(rounded.toFixed(MONEY_SCALE));
}

export function decimal128MoneyPlugin(schema: Schema) {
  schema.eachPath((_path, schemaType: any) => {
    if (schemaType?.instance !== 'Decimal128') return;
    schemaType.set((value: unknown) => normalizeMoneyDecimal128(value));
  });
}
