import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product, ProductDocument } from '../product/product.schema';

@Schema({ timestamps: true })
export class ProductionIngredient {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  product: Types.ObjectId;

  @Prop({ type: Number, required: true })
  item_qty: number;

  @Prop({ type: Types.Decimal128, required: true }) total_cost: Types.Decimal128;
}

export type ProductionIngredientDocument = ProductionIngredient & Document & { product: ProductDocument };
export const ProductionIngredientSchema = SchemaFactory.createForClass(ProductionIngredient);
