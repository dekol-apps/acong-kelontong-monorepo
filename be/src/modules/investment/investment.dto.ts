import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { PaginationDto } from 'src/global/global.dto';
import { FlowType } from 'src/types/interfaces';

export class InvestmentDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  transaction_amount: number;

  @IsNotEmpty()
  @MinLength(1)
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  description?: string;
}

export class ListInvestmentDTO extends PaginationDto {
  movement_type?: FlowType;
}