import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InvestmentType } from 'src/types/interfaces';
import { decimalToNumber } from 'src/utils/helper';

@Schema({ timestamps: true })
export class Investment {

  @Prop({
    type: String,
    enum: InvestmentType,
    required: true,
  })
  investment_type: InvestmentType;

  @Prop({ type: Types.Decimal128, required: true, min: 1, get: (v) => decimalToNumber(v) })
  transaction_amount: Types.Decimal128;

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
