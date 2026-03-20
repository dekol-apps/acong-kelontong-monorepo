import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class FilterDto {
  @IsString()
  @IsNotEmpty()
  column: string;

  @IsOptional()
  value?: string | number | boolean | Array<string | number | boolean> | Types.ObjectId;
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
   * - FilterDto
   * - FilterDto[]
   */
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  filter?: FilterDto | FilterDto[];
}
