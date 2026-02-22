import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Types } from 'mongoose';
import { ApprovalType } from 'src/types/interfaces';

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
  @IsInt()
  @Min(1)
  transaction_amount: Types.Decimal128;

  @IsNotEmpty()
  @MinLength(1)
  @IsArray()
  @IsString({ each: true })
  expense_attachments?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}