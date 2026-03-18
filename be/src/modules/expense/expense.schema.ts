import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PPhType } from 'src/types/interfaces';

export enum ExpenseStatus {
  CREATE = 'CREATE',
  REQUEST = 'REQUEST',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  COMPLETE = 'COMPLETE',
  DROP = 'DROP',
}


@Schema({ timestamps: true })
export class Expense {

  @Prop({ required: true })
  subject: string; // Electricity Feb 2026

  @Prop({ type: Types.Decimal128, required: true, min: 1 })
  transaction_amount: Types.Decimal128;

  @Prop({ required: true })
  expense_date: Date;

  @Prop({ type: String, enum: ExpenseStatus, required: true })
  status: ExpenseStatus;

  @Prop({ type: String, enum: PPhType, default: PPhType.NONE })
  pph_type: PPhType;

  @Prop({ type: Number, default: 0 })
  pph_rate: number;

  @Prop({ type: Types.Decimal128, default: 0 })
  pph_amount?: Types.Decimal128;

  @Prop()
  notes?: string;

  @Prop()
  reject_notes?: string;

  @Prop({ type: [String] })
  expense_attachments?: string[];
}

export type ExpenseDocument = Expense & Document;
export const ExpenseSchema = SchemaFactory.createForClass(Expense);