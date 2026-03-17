import { IsNumber, IsNotEmpty, Min, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/global/global.dto';

export class AccountingDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  transaction_amount: number;
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