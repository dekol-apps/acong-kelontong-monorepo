import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDate } from 'class-validator';
import { Document, Types } from 'mongoose';
import { FlowType, OrderType } from 'src/types/interfaces';

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

  @Prop({ required: true, min: 1 })
  transaction_amount: number;

  @Prop({ required: true })
  @IsDate()
  record_date?: Date
}

export type AccountingDocument = Accounting & Document;
export const AccountingSchema = SchemaFactory.createForClass(Accounting);