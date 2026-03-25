import { IsArray, IsEnum, IsNumber, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { InvestmentType } from 'src/types/interfaces';
import { IsMoney } from 'src/global/is-money.decorator';

export class InvestmentDto {
  @IsEnum(InvestmentType, {
    message: 'investment_type must be either DEPOSIT or WITHDRAWAL',
  })
  investment_type: InvestmentType;

  @IsMoney()
  @IsNotEmpty()
  transaction_amount: Types.Decimal128;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  description?: string;
}

export class ListInvestmentDTO extends PaginationDto {
  investment_type?: InvestmentType;
}