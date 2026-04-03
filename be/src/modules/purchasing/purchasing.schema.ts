import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Supplier, SupplierDocument } from '../supplier/supplier.schema';
import { PPnType } from 'src/types/interfaces';

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

export enum PaymentStatusEn {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
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

  @Prop({ type: String, enum: PurchasingEn, required: true })
  status: PurchasingEn;

  @Prop({ type: String, enum: PaymentStatusEn, default: PaymentStatusEn.UNPAID })
  payment_status: PaymentStatusEn;

  @Prop()
  ppn_facture_number?: string;

  @Prop()
  invoice_number?: string;

  @Prop()
  purchasing_attachments?: string[];

  @Prop({ type: Types.Decimal128 })
  payment_realization?: Types.Decimal128;

  @Prop({ type: Types.Decimal128 })
  paid_total?: Types.Decimal128;

  @Prop()
  notes?: string; // for example: notes for additional cost

  @Prop()
  reject_notes?: string; // APPROVAL step

  @Prop({ type: Date })
  completed_date?: Date; // Receive order step

  @Prop({ type: String, enum: PPnType })
  ppn_type?: PPnType;

  @Prop({ type: Number })
  ppn_rate?: number;

  @Prop({ type: Types.Decimal128 })
  ppn_amount?: Types.Decimal128;

  @Prop({ type: Types.Decimal128 })
  shipping_cost?: Types.Decimal128;
}

export type PurchasingDocument = Purchasing & Document & { supplier: SupplierDocument };
export const PurchasingSchema = SchemaFactory.createForClass(Purchasing);

export interface ValidatePaymentInput {
  total_price: Types.Decimal128;
  ppn_rate: number; // example 11 for 11%
  ppn_type: PPnType;
  ppn_amount: Types.Decimal128;
  payment_realization: Types.Decimal128;
  shipping_cost: Types.Decimal128;
}

export interface ValidatePaymentResult {
  expected_ppn_amount: Types.Decimal128;
  expected_payable: Types.Decimal128;
  predicted_additional_cost: Types.Decimal128;
  is_ppn_valid: boolean;
  is_payment_match: boolean;
}
