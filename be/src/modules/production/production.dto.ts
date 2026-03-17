import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsInt, Min, ArrayMinSize, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Types } from 'mongoose';

export class ProductionDto {
  @IsMongoId()
  @IsNotEmpty()
  product: Types.ObjectId; // Product being made

  @IsInt()
  @Min(1)
  item_qty: number; // Product being made qty

  @IsNotEmpty()
  @IsNumber()
  price_per_item: number;

  @IsNotEmpty()
  @IsNumber()
  operational_cost: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductionIngredientItemDto)
  ingredients: ProductionIngredientItemDto[];
}

export class ProductionIngredientItemDto {
  @IsMongoId()
  @IsNotEmpty()
  product: Types.ObjectId;

  @IsInt()
  @Min(1)
  item_qty: number;
}