import { Types } from 'mongoose';
import { IsArray, IsEnum, IsNumber, IsNotEmpty, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApprovalType, PPhType } from 'src/types/interfaces';
import { IsMoney } from 'src/global/is-money.decorator';

export class ExpenseApprovalDto {
  @IsNotEmpty()
  @IsEnum(ApprovalType, {
    message: 'approval must be either APPROVE or REJECT',
  })
  approval: ApprovalType;

  @IsOptional()
  @IsString()
  reject_notes?: string;
}

export class ExpenseDto {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  expense_date: Date;

  @IsNotEmpty()
  @IsMoney()
  transaction_amount: Types.Decimal128;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expense_attachments?: string[];

  @IsOptional()
  @IsEnum(PPhType, {
    message: 'pph_type must be either PPh23, PPh22 or PPh4_2',
  })
  pph_type?: PPhType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pph_rate?: number; // example 2 for 2%

  @IsOptional()
  @IsMoney()
  pph_amount?: Types.Decimal128;

  @IsOptional()
  @IsString()
  notes?: string;
}