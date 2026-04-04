import { PPhType } from '../enums/common.enum';

export enum ExpenseEn {
  CREATE = 'CREATE',
  REQUEST = 'REQUEST',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  COMPLETE = 'COMPLETE',
  DROP = 'DROP',
}

export interface IExpense {
  _id?: string;
  subject: string;
  expense_date?: Date | string;
  transaction_amount?: string;
  status?: ExpenseEn;
  pph_type?: PPhType;
  pph_rate?: number;
  pph_amount?: string;
  notes?: string;
  reject_notes?: string;
  expense_attachments?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
