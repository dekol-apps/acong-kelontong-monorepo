import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

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

  @Prop({ type: mongoose.Schema.Types.Decimal128, required: true, min: 1 })
  transaction_amount: mongoose.Schema.Types.Decimal128;

  @Prop({ required: true })
  expense_date: Date;

  @Prop({ enum: ExpenseStatus, required: true })
  status: ExpenseStatus;

  @Prop()
  notes?: string;

  @Prop()
  reject_notes?: string;

  @Prop({ type: [String] })
  expense_attachments?: string[];
}

export type ExpenseDocument = Expense & Document;
export const ExpenseSchema = SchemaFactory.createForClass(Expense);