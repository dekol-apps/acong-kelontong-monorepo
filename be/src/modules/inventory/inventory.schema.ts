import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ required: true }) inventory_name: string;
  @Prop({ type: Number, required: true, default: 0 }) total_qty: number;
  @Prop() description?: string;
}

export type InventoryDocument = Inventory & Document;
export const InventorySchema = SchemaFactory.createForClass(Inventory);