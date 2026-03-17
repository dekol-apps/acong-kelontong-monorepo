import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '../product/product.schema';
import { ProductionIngredient } from './production-ingerdient.schema';

export enum ProductionEn {
  CREATE = 'CREATE',
  START = 'START',
  FINISH = 'FINISH',
}

@Schema({ timestamps: true })
export class Production {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  product: Types.ObjectId;

  @Prop({ type: Number, required: true })
  item_qty: number;

  @Prop({ type: Types.Decimal128, required: true })
  price_per_item: Types.Decimal128;

  @Prop({ type: Types.Decimal128, required: true })
  operational_cost: Types.Decimal128;

  @Prop({ type: Types.Decimal128, required: true })
  grand_total_cost: Types.Decimal128;

  @Prop({ type: [ProductionIngredient], required: true })
  ingredients: ProductionIngredient[];

  @Prop({ enum: ProductionEn, required: true, default: ProductionEn.CREATE })
  status: ProductionEn;
}

export type ProductionDocument = Production & Document;
export const ProductionSchema = SchemaFactory.createForClass(Production);