import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Supplier, SupplierDocument } from '../supplier/supplier.schema';
import { PPhType, PPnType } from 'src/types/interfaces';

export enum PurchasingEn {
  CREATE = 'CREATE',
  REQUEST = 'REQUEST',
  REJECT = 'REJECT',
  APPROVE = 'APPROVE',
  PROCESS = 'PROCESS',
  RECEIVE = 'RECEIVE',
  COMPLETE = 'COMPLETE',
  DROP = 'DROP',
  EXPIRED = 'EXPIRED',
}

// PURCHASING as HEADER
@Schema({ timestamps: true })
export class Purchasing {
  @Prop({ type: Types.ObjectId, ref: Supplier.name, required: true })
  supplier: Types.ObjectId;

  @Prop({ required: true })
  supplier_name: string;

  @Prop({ type: Date })
  due_date?: Date;

  @Prop({ enum: PurchasingEn, required: true })
  status: PurchasingEn;

  @Prop()
  ppn_facture_number?: string;

  @Prop()
  invoice_number?: string;

  @Prop()
  purchasing_attachments?: string[];

  @Prop({ type: Types.Decimal128, default: 0 })
  payment_realization?: Types.Decimal128;

  @Prop()
  notes?: string; // for example: notes for additional cost

  @Prop()
  reject_notes?: string; // APPROVAL step

  @Prop({ type: Date })
  completed_date?: Date; // Receive order step

  @Prop({ enum: PPhType, default: PPhType.NONE })
  pph_type: PPhType;

  @Prop({ type: Number, default: 0 })
  pph_rate: number;

  @Prop({ type: Types.Decimal128, default: 0 })
  pph_amount?: Types.Decimal128;

  @Prop({ enum: PPnType, default: PPnType.NONE })
  ppn_type: PPnType;

  @Prop({ type: Number, default: 0 })
  ppn_rate: number;

  @Prop({ type: Types.Decimal128, default: 0 })
  ppn_amount?: Types.Decimal128;

  @Prop({ type: Types.Decimal128, default: 0 })
  shipping_cost: Types.Decimal128;
}

export type PurchasingDocument = Purchasing & Document & { supplier: SupplierDocument };
export const PurchasingSchema = SchemaFactory.createForClass(Purchasing);

export interface ValidatePaymentInput {
  tax_base: Types.Decimal128;
  pph_rate: number; // example 2 for 2%
  ppn_rate: number; // example 11 for 11%
  pph_type: PPhType;
  ppn_type: PPnType;
  pph_amount: Types.Decimal128;
  ppn_amount: Types.Decimal128;
  payment_realization: Types.Decimal128;
  shipping_cost: Types.Decimal128;
}

export interface ValidatePaymentResult {
  expected_ppn_amount: Types.Decimal128;
  expected_pph_amount: Types.Decimal128;
  expected_payable: Types.Decimal128;
  predicted_additional_cost: Types.Decimal128;
  is_ppn_valid: boolean;
  is_pph_valid: boolean;
  is_payment_match: boolean;
}
