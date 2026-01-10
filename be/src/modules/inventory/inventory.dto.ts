import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';

export class InventoryDto {
  @IsString()
  @IsNotEmpty()
  inventory_name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class ListInventoryItemsDTO extends PaginationDto {
  inventory_id: Types.ObjectId
}