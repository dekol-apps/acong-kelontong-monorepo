import { IsInt, IsNotEmpty, Min } from 'class-validator';
import mongoose from 'mongoose';

export class AccountingDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  transaction_amount: mongoose.Schema.Types.Decimal128;
}