import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product, ProductDocument } from '../product/product.schema';

@Schema({ timestamps: true })
export class InventoryItem {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true }) product: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true }) inventory: Types.ObjectId;
  @Prop({ required: true }) product_name: string;
  @Prop({ type: Number, required: true }) item_qty: number;
  @Prop({ required: true }) regist_date: Date;
  @Prop() description?: string;
}

export type InventoryDocument = InventoryItem & Document & { inventory: InventoryDocument } & { product: ProductDocument };
export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);