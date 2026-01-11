import { IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';
import { Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';

export class InventoryItemDto {
  @IsMongoId()
  @IsNotEmpty()
  inventory: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  product: Types.ObjectId;

  @IsInt()
  @Min(1)
  item_qty: number;
}

export class ListInventoryItemsDTO extends PaginationDto {
  inventory_id: Types.ObjectId
}