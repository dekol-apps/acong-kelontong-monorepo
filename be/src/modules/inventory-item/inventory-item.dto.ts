import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { IsInt, IsMongoId, Min, ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested, IsDate, IsDecimal, IsNumber } from 'class-validator';
import { InventoryReconcileItem } from './inventory-reconcile.schema';
export class InventoryItemDto {
  @IsMongoId()
  @IsNotEmpty()
  product: Types.ObjectId;

  @IsDate()
  @IsNotEmpty()
  receive_date: Date;

  @IsNumber()
  @IsNotEmpty()
  original_ppn_rate: number;

  @IsDecimal()
  @IsNotEmpty()
  original_price: Types.Decimal128;

  @IsDecimal()
  @IsOptional()
  landed_cost: Types.Decimal128;
}

export class GInventoryItemDto extends InventoryItemDto {
  @IsInt()
  @Min(1)
  item_qty: number;
}

export class InventoryReconcileDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InventoryReconcileItem)
  items: InventoryReconcileItem[];

  @IsString()
  @IsOptional()
  description?: string;
}
