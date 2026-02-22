import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Product, ProductDocument } from '../product/product.schema';

@Schema({ timestamps: true })
export class SaleItem {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true, unique: true }) product: Types.ObjectId;
  @Prop({ required: true }) brand_name: string;
  @Prop({ required: true }) product_name: string;
  @Prop({ required: false }) barcode?: string;
  @Prop({ type: Number, required: true }) item_qty: number;
  @Prop({ type: Types.Decimal128, required: true, default: 0 })
  sale_price: Types.Decimal128;
  @Prop({ type: Number, required: true, default: 0 })
  discount_percent: number;
  @Prop({ type: Number, required: true, default: 0 })
  ppn_rate: number;
  @Prop({ type: Number, required: true, default: 0 })
  discount_quota: number
}

export type SaleItemDocument = SaleItem & Document & { product: ProductDocument };
export const SaleItemSchema = SchemaFactory.createForClass(SaleItem);
