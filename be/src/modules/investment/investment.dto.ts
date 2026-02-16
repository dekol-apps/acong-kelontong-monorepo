import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { InvestmentType } from 'src/types/interfaces';

export class InvestmentDto {
  @IsEnum(InvestmentType, {
    message: 'investment_type must be either DEPOSIT or WITHDRAWAL',
  })
  investment_type: InvestmentType;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  transaction_amount: mongoose.Schema.Types.Decimal128;

  @IsNotEmpty()
  @MinLength(1)
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  description?: string;
}

export class ListInvestmentDTO extends PaginationDto {
  investment_type?: InvestmentType;
}