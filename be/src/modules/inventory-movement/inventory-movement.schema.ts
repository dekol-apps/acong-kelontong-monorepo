import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InventoryMovementType } from './inventory-movement.dto';
import { Inventory, InventoryDocument } from '../inventory/inventory.schema';

export class InventoryMovementItem {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Types.ObjectId;
    @Prop({ required: true }) product_name: string;
    @Prop({ required: true, min: 1 })
    item_qty: number;
}

export const InventoryMovementItemSchema = SchemaFactory.createForClass(InventoryMovementItem);

@Schema({ timestamps: true })
export class InventoryMovement {
    @Prop({ type: Types.ObjectId, ref: Inventory.name, required: true }) inventory: Types.ObjectId;
    @Prop({
        type: String,
        enum: InventoryMovementType,
        required: true,
    })
    movement_type: InventoryMovementType;
    @Prop({ type: Array<InventoryMovementItem> }) items: Array<InventoryMovementItem>;
    @Prop() description?: string;
    @Prop({ required: true }) regist_date: Date;
}

export type InventoryMovementDocument = InventoryMovement & Document & { inventory: InventoryDocument };
export const InventoryMovementSchema = SchemaFactory.createForClass(InventoryMovement);