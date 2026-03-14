import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProductDocument } from '../product/product.schema';
import { InventoryItem } from '../inventory-item/inventory-item.schema';

@Schema({ timestamps: true })
export class InventoryMovementItem extends InventoryItem {

}

export type InventoryMovementItemDocument = InventoryMovementItem & Document & { product: ProductDocument };
export const InventoryMovementItemSchema = SchemaFactory.createForClass(InventoryMovementItem);
