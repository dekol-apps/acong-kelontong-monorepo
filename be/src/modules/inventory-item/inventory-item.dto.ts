import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { IsInt, Min, ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested, IsDate } from 'class-validator';
import { IsObjectId } from '../../global/is-object-id.decorator';
import { InventoryReconcileItem } from './inventory-reconcile.schema';
import { IsMoney } from 'src/global/is-money.decorator';
export class InventoryItemDto {
  @IsObjectId()
  @IsNotEmpty()
  product: Types.ObjectId;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  receive_date: Date;

  @IsMoney()
  @IsNotEmpty()
  original_price: Types.Decimal128;

  @IsMoney()
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
