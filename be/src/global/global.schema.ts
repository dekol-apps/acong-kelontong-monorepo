import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Trash {
  @Prop({ type: Types.ObjectId, required: true })
  target_id: Types.ObjectId;

  @Prop({ type: Object })
  target_data: object;
}

export type TrashDocument = Trash & Document;
export const TrashSchema = SchemaFactory.createForClass(Trash);

// Add index for automatic cleanup (MongoDB TTL)
TrashSchema.index({ updatedAt: 1 }, {
  expireAfterSeconds: 60 * 60 * 24 * 30 // 30 days after updatedAt
});
