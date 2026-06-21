import { Type } from 'class-transformer';
import { IsObjectId } from 'src/global/is-object-id.decorator';
import { IsNotEmpty, IsInt, Min, ArrayMinSize, IsArray, ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { ProductionEn } from './production.schema';
import { IsMoney } from 'src/global/is-money.decorator';

export class ProductionDto {
  @IsObjectId()
  @IsNotEmpty()
  product: Types.ObjectId; // Product being made

  @IsInt()
  @Type(() => Number)
  @Min(1)
  item_qty: number; // Product being made qty

  @IsNotEmpty()
  @IsMoney()
  price_per_item: Types.Decimal128;

  @IsNotEmpty()
  @IsMoney()
  operational_cost: Types.Decimal128;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductionIngredientItemDto)
  ingredients: ProductionIngredientItemDto[];
}

export class ProductionIngredientItemDto {
  @IsObjectId()
  @IsNotEmpty()
  product: Types.ObjectId;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  item_qty: number;
}

export class ListProductionDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProductionEn)
  status?: ProductionEn;
}