import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class AccountingDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  transaction_amount: number;
}