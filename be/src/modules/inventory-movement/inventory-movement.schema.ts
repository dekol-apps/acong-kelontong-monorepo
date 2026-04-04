import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FlowType, OrderType } from 'src/types/interfaces';
import { InventoryMovementItemSchema, InventoryMovementItem } from './inventory-movement-item.schema';

@Schema({ timestamps: true })
export class InventoryMovement {
    @Prop({
        type: String,
        enum: FlowType,
        required: true,
    })
    movement_type: FlowType;
    @Prop({
        type: String,
        enum: OrderType,
        required: true,
    })
    order_type: OrderType;
    @Prop({ type: Types.ObjectId }) source_id?: Types.ObjectId;
    @Prop({ type: [InventoryMovementItemSchema], required: true }) items: InventoryMovementItem[];
    @Prop() description?: string;
}

export type InventoryMovementDocument = InventoryMovement & Document;
export const InventoryMovementSchema = SchemaFactory.createForClass(InventoryMovement);