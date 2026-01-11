import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product, ProductDocument } from '../product/product.schema';
import { Inventory, InventoryDocument } from '../inventory/inventory.schema';

@Schema({ timestamps: true })
export class InventoryItem {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true }) product: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: Inventory.name, required: true }) inventory: Types.ObjectId;
  @Prop({ required: true }) product_name: string;
  @Prop({ type: Number, required: true }) item_qty: number;
}

export type InventoryItemDocument = InventoryItem & Document & { inventory: InventoryDocument } & { product: ProductDocument };
export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);