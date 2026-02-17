import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Inventory, InventoryDocument } from '../inventory/inventory.schema';
import { FlowType } from 'src/types/interfaces';
import { Product } from '../product/product.schema';
export class InventoryMovementItem {
    @Prop({ type: Types.ObjectId, ref: Product.name, required: true }) product: Types.ObjectId;
    @Prop({ required: true }) product_name: string;
    @Prop({ type: Number, required: true }) item_qty: number;
}

export const InventoryMovementItemSchema = SchemaFactory.createForClass(InventoryMovementItem);

@Schema({ timestamps: true })
export class InventoryMovement {
    @Prop({ type: Types.ObjectId, ref: Inventory.name, required: true }) inventory: Types.ObjectId;
    @Prop({
        type: String,
        enum: FlowType,
        required: true,
    })
    movement_type: FlowType;
    @Prop({ type: [InventoryMovementItemSchema], required: true }) items: InventoryMovementItem[];
    @Prop() description?: string;
    @Prop({ required: true }) regist_date: Date;
}

export type InventoryMovementDocument = InventoryMovement & Document & { inventory: InventoryDocument };
export const InventoryMovementSchema = SchemaFactory.createForClass(InventoryMovement);