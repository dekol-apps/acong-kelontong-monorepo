import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AccountingSnapshot {
  @Prop({ type: Types.Decimal128, required: true })
  balance: Types.Decimal128;

  @Prop({ type: Types.Decimal128, required: true })
  investment: Types.Decimal128;

  @Prop({ type: Types.Decimal128, required: true })
  total_assets: Types.Decimal128;

  @Prop({ type: Types.Decimal128, required: true })
  revenue: Types.Decimal128;

  @Prop({ type: Types.Decimal128, required: true })
  profit: Types.Decimal128;

  @Prop({ type: Types.Decimal128, required: true })
  cogs: Types.Decimal128;

  @Prop({ type: Types.Decimal128, required: true })
  equity: Types.Decimal128;

  @Prop({ required: true, default: Date.now })
  snapshot_date: Date;
}

export type AccountingSnapshotDocument = AccountingSnapshot & Document;
export const AccountingSnapshotSchema = SchemaFactory.createForClass(AccountingSnapshot);
