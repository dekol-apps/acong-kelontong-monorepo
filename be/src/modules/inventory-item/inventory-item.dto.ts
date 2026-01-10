import { IsDate, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class InventoryItemDto {
  @IsMongoId()
  @IsNotEmpty()
  product: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  inventory: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  item_qty: number;

  @IsString()
  @IsOptional()
  description?: string;
}
