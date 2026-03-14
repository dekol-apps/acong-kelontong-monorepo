import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Inventory } from './inventory.schema';

export class InventoryReconcileItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true }) product: Types.ObjectId;
  @Prop({ required: true }) product_name: string;
  @Prop({ required: true }) item_qty: number;
}
@Schema({ timestamps: true })
export class InventoryReconcile {
  @Prop({ type: Types.ObjectId, ref: Inventory.name, required: true }) inventory: Types.ObjectId;
  @Prop({ type: [InventoryReconcileItem], required: true }) itemsBefore: InventoryReconcileItem[];
  @Prop({ type: [InventoryReconcileItem], required: true }) itemsAfter: InventoryReconcileItem[];
  @Prop() description?: string;
}

export type InventoryDocument = InventoryReconcile & Document;
export const InventoryReconcileSchema = SchemaFactory.createForClass(InventoryReconcile);