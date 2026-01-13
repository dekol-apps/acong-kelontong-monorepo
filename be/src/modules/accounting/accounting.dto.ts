import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AccountingDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  transaction_amount: number;
}