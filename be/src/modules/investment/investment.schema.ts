import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { FlowType } from 'src/types/interfaces';

@Schema({ timestamps: true })
export class Investment {

  @Prop({
    type: String,
    enum: FlowType,
    required: true,
  })
  flow_type: FlowType;

  @Prop({ type: mongoose.Schema.Types.Decimal128, required: true, min: 1 })
  transaction_amount: mongoose.Schema.Types.Decimal128;

  @Prop()
  attachments?: string[];

  @Prop()
  description?: string;
}

export type InvestmentDocument = Investment & Document;
export const InvestmentSchema = SchemaFactory.createForClass(Investment);

// Add index for automatic cleanup (MongoDB TTL)
InvestmentSchema.index({ updatedAt: 1 }, {
  expireAfterSeconds: 60 * 60 * 24 * 30 // 30 days after updatedAt
});
