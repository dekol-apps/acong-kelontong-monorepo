import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ApprovalTypeEn {
  PURCHASING = 'PURCHASING',
  EXPENSES = 'EXPENSES',
}

export enum ApprovalStatusEn {
  REQUEST = 'REQUEST',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

// PURCHASING as HEADER
@Schema({ timestamps: true })
export class Approval {
  @Prop({ enum: ApprovalTypeEn, required: true })
  approval_type: ApprovalTypeEn;

  @Prop({ enum: ApprovalStatusEn, required: true })
  approval_status: ApprovalStatusEn;

  @Prop({ type: Date })
  approval_due_date?: Date;

  @Prop({ type: Object })
  approval_data: object;

  @Prop({ type: Object })
  approval_data_id: Types.ObjectId;

  @Prop()
  approval_cost?: number;

  @Prop()
  approval_note?: string;
}


export type ApprovalDocument = Approval & Document;
export const ApprovalSchema = SchemaFactory.createForClass(Approval);

// Remove data that exceeded the due date (MongoDB TTL)
ApprovalSchema.index({ approval_due_date: 1 }, { expireAfterSeconds: 0 });