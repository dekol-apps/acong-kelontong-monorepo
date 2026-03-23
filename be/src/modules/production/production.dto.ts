import { Type } from 'class-transformer';
import { IsObjectId } from 'src/global/is-object-id.decorator';
import { IsNotEmpty, IsInt, Min, ArrayMinSize, IsArray, ValidateNested, IsDecimal } from 'class-validator';
import { Types } from 'mongoose';

export class ProductionDto {
  @IsObjectId()
  @IsNotEmpty()
  product: Types.ObjectId; // Product being made

  @IsInt()
  @Min(1)
  item_qty: number; // Product being made qty

  @IsNotEmpty()
  @IsDecimal()
  price_per_item: Types.Decimal128;

  @IsNotEmpty()
  @IsDecimal()
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
  @Min(1)
  item_qty: number;
}