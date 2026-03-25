import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from 'src/global/global.dto';

import { Types } from 'mongoose';
import { FlowType, OrderType } from 'src/types/interfaces';
import { IsMoney } from 'src/global/is-money.decorator';

export class AccountingDto {
  @IsMoney()
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
  @IsEnum(FlowType, { message: `flow_type must be either 'IN' or 'OUT'` })
  flow_type?: FlowType;

  @IsOptional()
  @IsEnum(OrderType, { message: `order_type must be either 'SALES' or 'PURCHASE'` })
  order_type?: OrderType;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}