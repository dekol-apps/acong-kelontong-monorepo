import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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

  @Prop({ required: true, default: 0 })
  amount: number;
}

export type AccountingBalanceDocument = AccountingBalance & Document;
export const AccountingBalanceSchema = SchemaFactory.createForClass(AccountingBalance);