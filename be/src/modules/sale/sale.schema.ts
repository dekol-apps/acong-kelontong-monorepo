import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SaleItem, SaleItemSchema } from './sale-item.schema';

@Schema({ timestamps: true })
export class Sale { 
  @Prop({ type: [SaleItemSchema], required: true }) items: SaleItem[];

  @Prop({ type: Types.Decimal128, required: true })
  total_before_tax: Types.Decimal128;

  @Prop({ type: Types.Decimal128, required: true })
  total_ppn: Types.Decimal128;

  @Prop({ type: Types.Decimal128, required: true })
  total_discount: Types.Decimal128;

  @Prop({ type: Types.Decimal128, required: true, default: 0 })
  total_cogs: Types.Decimal128;

  @Prop({ type: Types.Decimal128, required: true })
  grand_total: Types.Decimal128;
}

export type SaleDocument = Sale & Document & { inventory: SaleDocument };
export const SaleSchema = SchemaFactory.createForClass(Sale);