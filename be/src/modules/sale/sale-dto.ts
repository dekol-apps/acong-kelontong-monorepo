import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsOptional, IsNumber, ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';

export class SaleItemDto {
  @IsMongoId()
  @IsNotEmpty()
  product: Types.ObjectId;

  @IsNotEmpty()
  @IsNumber()
  item_qty: number;

  @IsNotEmpty()
  @IsNumber()
  sale_price: Types.Decimal128;

  @IsOptional()
  @IsNumber()
  discount_percent?: number;

  @IsOptional()
  @IsNumber()
  discount_quota?: number

  @IsOptional()
  @IsNumber()
  ppn_rate?: number; // example 11 for 11%
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

  @IsNotEmpty()
  @IsNumber()
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
}