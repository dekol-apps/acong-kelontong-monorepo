import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { InventoryMovementItemSchema, InventoryMovementItem } from '../inventory-movement/inventory-movement-item.schema';
import { Inventory } from './inventory.schema';

@Schema({ timestamps: true })
export class InventoryReconcile {
  @Prop({ type: Types.ObjectId, ref: Inventory.name, required: true }) inventory: Types.ObjectId;
  @Prop({ type: [InventoryMovementItemSchema], required: true }) itemsBefore: InventoryMovementItem[];
  @Prop({ type: [InventoryMovementItemSchema], required: true }) itemsAfter: InventoryMovementItem[];
  @Prop() description?: string;
}

export type InventoryDocument = InventoryReconcile & Document;
export const InventoryReconcileSchema = SchemaFactory.createForClass(InventoryReconcile);