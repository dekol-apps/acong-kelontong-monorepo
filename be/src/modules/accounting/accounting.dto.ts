import { IsNotEmpty, IsOptional, IsString, IsDecimal, IsEnum } from 'class-validator';
import { PaginationDto } from 'src/global/global.dto';

import { Types } from 'mongoose';
import { FlowType, OrderType } from 'src/types/interfaces';

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

export class ListAccountingDto extends PaginationDto {
  @IsOptional()
  @IsEnum(FlowType)
  flow_type?: FlowType;

  @IsOptional()
  @IsEnum(OrderType)
  order_type?: OrderType;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}