import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Product, ProductDocument } from '../product/product.schema';

@Schema({ timestamps: true })
export class SaleItem {
  // No unique index on product — one document represents one physical unit (same as InventoryItem)
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true }) product: Types.ObjectId;
  @Prop({ required: true }) brand_name: string;
  @Prop({ required: true }) product_name: string;
  @Prop({ required: false }) barcode?: string;
  @Prop({ type: Types.Decimal128, required: true, default: 0 })
  sale_price: Types.Decimal128;
  @Prop({ type: Number, required: true, default: 0 })
  discount_percent: number;
  @Prop({ type: Number, required: true, default: 0 })
  ppn_rate: number;
  @Prop({ type: Types.Decimal128, required: true, default: 0 })
  net_price: Types.Decimal128;
  @Prop({ type: Types.Decimal128, required: true, default: 0 })
  discount_amount: Types.Decimal128;
  /** Cost of Goods Sold — copied from the source InventoryItem.landed_cost at stocking time */
  @Prop({ type: Types.Decimal128 }) cogs?: Types.Decimal128;
}

export type SaleItemDocument = SaleItem & Document & { product: ProductDocument };
export const SaleItemSchema = SchemaFactory.createForClass(SaleItem);
