import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

export class SaleItemDto {
  /**
   * Specific InventoryItem document IDs to pull from inventory.
   * - Each ID represents one physical unit.
   * - All IDs in one entry should belong to the same product.
   * - The landed_cost of each InventoryItem becomes the COGS of the resulting SaleItem.
   */
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  inventory_item_ids: Types.ObjectId[];

  /**
   * Sale price per unit applied to every unit in this group.
   * (JS number in DTO; converted to Decimal128 in service)
   */
  @IsNotEmpty()
  @IsNumber()
  sale_price: number;

  @IsOptional()
  @IsNumber()
  discount_percent?: number;

  @IsOptional()
  @IsNumber()
  ppn_rate?: number; // e.g. 11 for 11%
}

export class SaleDto {
  /**
   * The inventory to pull stock from.
   * The service validates that every inventory_item_id belongs to this inventory.
   */
  @IsMongoId()
  @IsNotEmpty()
  inventory: Types.ObjectId;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}

export class SellingSaleItemDto {
  @IsMongoId()
  @IsNotEmpty()
  product: Types.ObjectId;

  @IsInt()
  @Min(1)
  item_qty: number;
}

export class SellingSaleDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SellingSaleItemDto)
  items: SellingSaleItemDto[];
}

export interface CalculateSaleResult {
  total_before_tax: Types.Decimal128;
  total_ppn: Types.Decimal128;
  grand_total: Types.Decimal128;
  total_discount: Types.Decimal128;
  /** Sum of landed_cost (COGS) for all items sold in this transaction */
  total_cogs: Types.Decimal128;
}