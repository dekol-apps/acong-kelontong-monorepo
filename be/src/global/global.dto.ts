import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';

export class FilterDto {
  @IsString()
  @IsNotEmpty()
  column: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  value?: string | number | boolean | Types.ObjectId | Array<string | number | boolean | Types.ObjectId>;
}
export class PaginationDto {
  @IsOptional()
  @Type(() => Number) //automatically parse incoming string representations of numbers
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number) //automatically parse incoming string representations of numbers
  @IsInt()
  size?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchFields?: string[];

  /**
   * Accepts:
   * - FilterDto (object)
   * - FilterDto[] (array)
   */
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  filter?: FilterDto | FilterDto[];

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;
}
