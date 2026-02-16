import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { InventoryMovementItemDto } from '../inventory-movement/inventory-movement.dto';

export class InventoryItemDto extends InventoryMovementItemDto {
  @IsMongoId()
  @IsNotEmpty()
  inventory: Types.ObjectId;
}

export class ListInventoryItemsDTO extends PaginationDto {
  inventory_id: Types.ObjectId
}