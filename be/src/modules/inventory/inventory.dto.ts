import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InventoryDto {
  @IsString()
  @IsNotEmpty()
  inventory_name: string;

  @IsString()
  @IsOptional()
  description?: string;
}