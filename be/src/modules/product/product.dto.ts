import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { UnitOfMeasure } from 'src/types/enums';
import { IsObjectId } from 'src/global/is-object-id.decorator';
import { Types } from 'mongoose';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  product_name: string;

  @IsOptional()
  @IsString()
  product_description?: string;

  @IsNotEmpty()
  @IsEnum(UnitOfMeasure)
  unit_of_measure: UnitOfMeasure;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsNotEmpty()
  @IsObjectId()
  brand: Types.ObjectId;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  product_name?: string;

  @IsOptional()
  @IsString()
  product_description?: string;

  @IsOptional()
  @IsEnum(UnitOfMeasure)
  unit_of_measure?: UnitOfMeasure;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsObjectId()
  brand?: Types.ObjectId;
}
