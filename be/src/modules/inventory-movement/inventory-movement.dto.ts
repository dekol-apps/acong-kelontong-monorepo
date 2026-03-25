import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString, ValidateNested, IsNotEmpty, IsInt, Min, IsDate, IsNumber } from 'class-validator';
import { FlowType, OrderType } from '../../types/interfaces';
import { PaginationDto } from '../../global/global.dto';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { IsObjectId } from '../../global/is-object-id.decorator';
import { IsMoney } from 'src/global/is-money.decorator';

export class InventoryMovementItemDto {
  @IsObjectId()
  @IsNotEmpty()
  product: Types.ObjectId;

  @IsInt()
  @Min(1)
  item_qty: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  receive_date?: Date;

  @IsNumber()
  @IsOptional()
  original_ppn_rate?: number;

  @IsMoney()
  @IsOptional()
  original_price?: Types.Decimal128;

  @IsMoney()
  @IsOptional()
  original_ppn_amount?: Types.Decimal128;

  @IsMoney()
  @IsOptional()
  landed_cost?: Types.Decimal128;
}

export class InventoryMovementDto {

  @IsEnum(FlowType, {
    message: 'movement_type must be either IN or OUT',
  })
  movement_type: FlowType;

  @IsEnum(OrderType, {
    message: 'order_type invalid enum',
  })
  order_type: OrderType;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InventoryMovementItemDto)
  items: InventoryMovementItemDto[];

  @IsString()
  @IsOptional()
  description?: string;
}

export class ManualInventoryMovementItemDto {
  @IsObjectId()
  @IsNotEmpty()
  product: Types.ObjectId;

  @IsInt()
  @Min(1)
  item_qty: number;

  @IsMoney()
  @IsNotEmpty()
  original_price: Types.Decimal128;
}

export class ManualInventoryMovementDTO {
  @IsEnum(FlowType, {
    message: 'movement_type must be either IN or OUT',
  })
  movement_type: FlowType;

  @IsEnum(OrderType, {
    message: 'order_type invalid enum',
  })
  order_type: OrderType;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ManualInventoryMovementItemDto)
  items: ManualInventoryMovementItemDto[];

  @IsString()
  @IsOptional()
  description?: string;
}

export class ListInventoryMovementDTO extends PaginationDto {
  @IsOptional()
  @IsEnum(FlowType)
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
