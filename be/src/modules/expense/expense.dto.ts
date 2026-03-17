import { IsArray, IsEnum, IsNumber, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApprovalType, PPhType } from 'src/types/interfaces';

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

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  transaction_amount: number;

  @IsNotEmpty()
  @MinLength(1)
  @IsArray()
  @IsString({ each: true })
  expense_attachments?: string[];

  @IsOptional()
  @IsEnum(PPhType, {
    message: 'pph_type must be either PPh23, PPh22 or PPh4_2',
  })
  pph_type?: PPhType;

  @IsOptional()
  @IsNumber()
  pph_rate?: number; // example 2 for 2%

  @IsOptional()
  @IsString()
  notes?: string;
}