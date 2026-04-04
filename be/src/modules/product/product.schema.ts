import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Brand, BrandDocument } from '../brand/brand.schema';
import { UnitOfMeasure } from 'src/types/enums';

@Schema({ timestamps: true })
export class Product {

  @Prop({ required: true })
  product_name: string;
  @Prop({ required: true, unique: true })
  product_sku: string;
  @Prop()
  product_description?: string;
  @Prop({ type: String, required: true, enum: UnitOfMeasure })
  unit_of_measure: UnitOfMeasure;
  @Prop()
  barcode?: string;
  @Prop({ type: Types.ObjectId, ref: Brand.name, required: true })
  brand: Types.ObjectId;
}

export type ProductDocument = Product & Document & { brand: BrandDocument };
export const ProductSchema = SchemaFactory.createForClass(Product);