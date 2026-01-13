import { ArrayMinSize, IsArray, IsEnum, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { FlowType } from 'src/types/interfaces';
import { PaginationDto } from 'src/global/global.dto';

export class InventoryMovementItemDto {
  @IsMongoId()
  @IsNotEmpty()
  product: Types.ObjectId;

  @IsInt()
  @Min(1)
  item_qty: number;
}

export class InventoryMovementDto {
  @IsMongoId()
  @IsNotEmpty()
  inventory: Types.ObjectId;

  @IsEnum(FlowType, {
    message: 'movement_type must be either IN or OUT',
  })
  movement_type: FlowType;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InventoryMovementItemDto)
  items: InventoryMovementItemDto[];

  @IsString()
  @IsOptional()
  description?: string;
}

export class ListInventoryMovementDTO extends PaginationDto {
  movement_type?: FlowType;
}