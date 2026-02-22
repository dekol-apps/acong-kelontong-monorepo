import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Types } from 'mongoose';

export class AccountingDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  transaction_amount: Types.Decimal128;
}