import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @IsNotEmpty()
  @IsString()
  brand_name: string;

  @IsOptional()
  @IsString()
  brand_description?: string;
}

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  brand_name?: string;

  @IsOptional()
  @IsString()
  brand_description?: string;
}
