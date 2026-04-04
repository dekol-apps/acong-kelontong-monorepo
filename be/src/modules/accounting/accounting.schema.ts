import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDate } from 'class-validator';
import { Document, Types } from 'mongoose';
import { FlowType, OrderType, PPhType, PPnType } from 'src/types/interfaces';

@Schema({ timestamps: true })
export class Accounting {
  @Prop({
    type: String,
    enum: FlowType,
    required: true,
  })
  flow_type: FlowType;

  @Prop({ type: Types.ObjectId, required: true })
  order_id: Types.ObjectId;

  @Prop({ type: Object })
  order_data: object;

  @Prop({
    type: String,
    enum: OrderType,
    required: true,
  })
  order_type: OrderType;

  @Prop({ type: Types.Decimal128, required: true, min: 1 })
  transaction_amount: Types.Decimal128;

  @Prop({ type: Types.Decimal128, required: true, default: 0 })
  tax_base: Types.Decimal128;

  @Prop({ type: String, enum: PPnType, default: PPnType.NONE })
  ppn_type?: PPnType;

  @Prop({ type: Number, default: 0 })
  ppn_rate?: number;

  @Prop({ type: Types.Decimal128, default: 0 })
  ppn_amount?: Types.Decimal128;

  @Prop({ type: String, enum: PPhType, default: PPhType.NONE })
  pph_type?: PPhType;

  @Prop({ type: Number, default: 0 })
  pph_rate?: number;

  @Prop({ type: Types.Decimal128, default: 0 })
  pph_amount?: Types.Decimal128;

  @Prop()
  tax_facture_number?: string

  @Prop({ required: true })
  @IsDate()
  record_date?: Date

  // This is reference of older incorrect accounting row that being corrected
  @Prop({ type: Types.ObjectId })
  correction_id?: Types.ObjectId;

  @Prop({ type: Object })
  correction_data?: object;
}

export type AccountingDocument = Accounting & Document;
export const AccountingSchema = SchemaFactory.createForClass(Accounting);

export interface IEditAccountingByOrder {
  transaction_amount?: Types.Decimal128;
  tax_base?: Types.Decimal128;
  ppn_type?: PPnType;
  ppn_rate?: number;
  ppn_amount?: Types.Decimal128;
  pph_type?: PPhType;
  pph_rate?: number;
  pph_amount?: Types.Decimal128;
  tax_facture_number?: string;
  record_date?: Date;
  order_data?: object;
}