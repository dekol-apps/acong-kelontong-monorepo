import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProductDocument } from '../product/product.schema';
import { Inventory, InventoryDocument } from '../inventory/inventory.schema';
import { InventoryMovementItem } from '../inventory-movement/inventory-movement.schema';

@Schema({ timestamps: true })
export class InventoryItem extends InventoryMovementItem{
  @Prop({ type: Types.ObjectId, ref: Inventory.name, required: true }) inventory: Types.ObjectId;
}

export type InventoryItemDocument = InventoryItem & Document & { inventory: InventoryDocument } & { product: ProductDocument };
export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);
InventoryItemSchema.index(
  { inventory: 1, product: 1 },
  { unique: true }
);
