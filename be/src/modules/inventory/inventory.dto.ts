import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { InventoryMovementItemDto } from '../inventory-movement/inventory-movement.dto';
export class InventoryDto {
  @IsString()
  @IsNotEmpty()
  inventory_name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class InventoryReconcileDto {
  @IsMongoId()
  @IsNotEmpty()
  inventory: Types.ObjectId;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InventoryMovementItemDto)
  items: InventoryMovementItemDto[];

  @IsString()
  @IsOptional()
  description?: string;
}
