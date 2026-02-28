import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CurrencyEn } from 'src/types/interfaces';

@Schema()
export class AccountingBalance {
  @Prop({
    type: String,
    enum: CurrencyEn,
    required: true,
    unique: true
  })
  currency: CurrencyEn;

  @Prop({ type: Types.Decimal128, required: true, min: 0 })
  amount: Types.Decimal128;
}

export type AccountingBalanceDocument = AccountingBalance & Document;
export const AccountingBalanceSchema = SchemaFactory.createForClass(AccountingBalance);