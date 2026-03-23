import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProductDocument } from '../product/product.schema';
import { InventoryItem } from '../inventory-item/inventory-item.schema';

@Schema({ timestamps: true })
export class InventoryMovementItem extends InventoryItem {
    @Prop({ type: Number, required: true })
    item_qty: number;
}

export type InventoryMovementItemDocument = InventoryMovementItem & Document & { product: ProductDocument };
export const InventoryMovementItemSchema = SchemaFactory.createForClass(InventoryMovementItem);
