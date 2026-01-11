import { ArrayMinSize, IsArray, IsEnum, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export enum InventoryMovementType {
  IN = 'IN',
  OUT = 'OUT',
}

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

  @IsEnum(InventoryMovementType, {
    message: 'movement_type must be either IN or OUT',
  })
  movement_type: InventoryMovementType;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InventoryMovementItemDto)
  items: InventoryMovementItemDto[];

  @IsString()
  @IsOptional()
  description?: string;
}