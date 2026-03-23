import { IsNumber, IsNotEmpty, Min, IsOptional, IsString, IsDecimal } from 'class-validator';
import { PaginationDto } from 'src/global/global.dto';

import { Types } from 'mongoose';

export class AccountingDto {
  @IsDecimal()
  @IsNotEmpty()
  transaction_amount: Types.Decimal128;
}

export class TaxTransactionFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  hasPpnOnly?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}