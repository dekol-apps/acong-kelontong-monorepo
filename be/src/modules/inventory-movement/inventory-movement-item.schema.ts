import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Product, ProductDocument } from '../product/product.schema';

@Schema({ timestamps: true })
export class InventoryMovementItem {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true }) product: Types.ObjectId;
  @Prop({ required: true }) product_name: string;
  @Prop({ type: Number, required: true }) item_qty: number;
  
  // Track specific cost per item unit for COGS logic
  @Prop({ type: Types.Decimal128 }) cogs?: Types.Decimal128;
}

export type InventoryMovementItemDocument = InventoryMovementItem & Document & { product: ProductDocument };
export const InventoryMovementItemSchema = SchemaFactory.createForClass(InventoryMovementItem);
