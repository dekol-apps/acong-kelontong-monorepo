import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { FlowType, OrderType } from 'src/types/interfaces';
import { PaginationDto } from 'src/global/global.dto';
import { Type } from 'class-transformer';
import { GInventoryItemDto } from '../inventory-item/inventory-item.dto';
import { Types } from 'mongoose';

export class InventoryMovementDto {

  @IsEnum(FlowType, {
    message: 'movement_type must be either IN or OUT',
  })
  movement_type: FlowType;

  @IsEnum(FlowType, {
    message: 'order_type invalid enum',
  })
  order_type: OrderType;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GInventoryItemDto)
  items: GInventoryItemDto[];

  @IsString()
  @IsOptional()
  description?: string;
}

export class ListInventoryMovementDTO extends PaginationDto {
  movement_type?: FlowType;
}

export interface MovedInventoryItemData {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  receive_date: Date;
  product_name: string;
  original_price: Types.Decimal128;
  original_ppn_rate: number;
  original_ppn_amount: Types.Decimal128;
  landed_cost: Types.Decimal128;
}
