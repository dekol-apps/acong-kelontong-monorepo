import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product, ProductDocument } from '../product/product.schema';

@Schema({ timestamps: true })
export class InventoryItem {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true }) product: Types.ObjectId;
  @Prop({ required: true }) product_name: string;
  @Prop({ required: true }) product_sku: string;
  @Prop({ type: Date, required: true }) receive_date: Date;
  @Prop({ type: Types.Decimal128, required: true }) original_price: Types.Decimal128;
  @Prop({ type: Number, required: true, default: 0 })
  original_ppn_rate: number;
  @Prop({ type: Types.Decimal128, required: true, default: 0 })
  original_ppn_amount: Types.Decimal128;
  // Track specific cost per item unit for Landed Cost logic
  @Prop({ type: Types.Decimal128 }) landed_cost: Types.Decimal128;
}

export type InventoryItemDocument = InventoryItem & Document & { product: ProductDocument };
export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);

