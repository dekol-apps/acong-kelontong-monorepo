import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Product, ProductDocument } from '../product/product.schema';
import { Purchasing, PurchasingDocument } from '../purchasing/purchasing.schema';

// PURCHASING ITEM as BODY
@Schema({ timestamps: true })
export class PurchasingItem {
  @Prop({ type: Types.ObjectId, ref: Purchasing.name, required: true })
  purchase_order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  product_name: string;

  @Prop({ required: true })
  supplier_name: string;

  @Prop({ type: Number, required: true })
  purchase_qty: number;

  @Prop({ type: Number, default: 0 })
  recieved_qty: number;

  @Prop({ type: mongoose.Schema.Types.Decimal128, required: true })
  purchase_price: mongoose.Schema.Types.Decimal128;
}

export type PurchasingItemDocument = PurchasingItem & Document & { product: ProductDocument } & { purchase_order: PurchasingDocument };
export const PurchasingItemSchema = SchemaFactory.createForClass(PurchasingItem);