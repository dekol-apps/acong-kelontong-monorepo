import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Supplier, SupplierDocument } from '../supplier/supplier.schema';

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
  invoice_number?: string;

  @Prop()
  purchasing_attachments?: string[];

  @Prop({ type: mongoose.Schema.Types.Decimal128, default: 0 })
  additional_cost?: mongoose.Schema.Types.Decimal128;

  @Prop()
  notes?: string; // for example: notes for additional cost

  @Prop()
  reject_notes?: string; // APPROVAL step

  @Prop({ type: Date })
  completed_date?: Date; // Receive order step
}


export type PurchasingDocument = Purchasing & Document & { supplier: SupplierDocument };
export const PurchasingSchema = SchemaFactory.createForClass(Purchasing);