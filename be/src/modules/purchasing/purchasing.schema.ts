import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Supplier, SupplierDocument } from '../supplier/supplier.schema';

export enum PurchasingEn {
  CREATE = 'CREATE',
  REQUEST = 'REQUEST',
  REJECT = 'REJECT',
  APPROVE = 'APPROVE',
  PROCESS = 'PROCESS',
  RECEIVE = 'RECEIVE',
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

  @Prop({ type: Date })
  received_at?: Date;

  @Prop()
  invoice_number?: string;

  @Prop()
  invoice_photo?: string;

  @Prop({ type: Number, default: 0 })
  total_purchase_price: number;

  @Prop({ type: Number, default: 0 })
  additional_cost?: number;

  @Prop()
  reject_notes?: string;
}


export type PurchasingDocument = Purchasing & Document & { supplier: SupplierDocument };
export const PurchasingSchema = SchemaFactory.createForClass(Purchasing);