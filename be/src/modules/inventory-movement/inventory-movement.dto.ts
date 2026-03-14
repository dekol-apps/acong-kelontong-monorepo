import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { FlowType, OrderType } from 'src/types/interfaces';
import { PaginationDto } from 'src/global/global.dto';
import { Type } from 'class-transformer';
import { InventoryItemDto } from '../inventory-item/inventory-item.dto';

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
  @Type(() => InventoryItemDto)
  items: InventoryItemDto[];

  @IsString()
  @IsOptional()
  description?: string;
}

export class ListInventoryMovementDTO extends PaginationDto {
  movement_type?: FlowType;
}