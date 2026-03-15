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
  IsDecimal,
} from 'class-validator';
import { Types } from 'mongoose';

export class SaleItemDto {
  /**
   * The product to pull from inventory.
   */
  @IsMongoId()
  @IsNotEmpty()
  product: Types.ObjectId;

  /**
   * Number of physical units to pull from inventory via FIFO.
   */
  @IsInt()
  @Min(1)
  item_qty: number;

  /**
   * Sale price per unit.
   * (JS number in DTO; converted to Decimal128 in service)
   */
  @IsNotEmpty()
  @IsNumber()
  sale_price: number;

  /**
   * Original price of the item. comes from data collection from inventory item as Decimal128
   */
  @IsNotEmpty()
  @IsDecimal()
  original_price: Types.Decimal128;

  @IsOptional()
  @IsNumber()
  discount_percent?: number;

  @IsOptional()
  @IsNumber()
  ppn_rate?: number; // e.g. 11 for 11%
}

export class SaleDto {
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