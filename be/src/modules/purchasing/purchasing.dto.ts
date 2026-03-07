import { IsNotEmpty, IsString, IsDate, IsOptional, IsMongoId, IsArray, MinLength, IsEnum, IsNumber } from 'class-validator';
import { Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { ApprovalType, PPhType, PPnType } from 'src/types/interfaces';
import { Purchasing } from './purchasing.schema';

export class PurchaseOrderApprovalDto {
  @IsNotEmpty()
  @IsEnum(ApprovalType, {
    message: 'approval must be either APPROVE or REJECT',
  })
  approval: ApprovalType;

  @IsOptional()
  reject_notes?: string;
}

export class PurchaseOrderDto extends PurchaseOrderApprovalDto {
  @IsOptional()
  @IsString()
  invoice_number?: string;

  @IsNotEmpty()
  @MinLength(1)
  @IsArray()
  @IsString({ each: true })
  purchasing_attachments?: string[];

  @IsOptional()
  @IsNumber()
  payment_realization?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(PPhType, {
    message: 'pph_type must be either PPh23, PPh22 or PPh4_2',
  })
  pph_type?: PPhType;

  @IsOptional()
  @IsEnum(PPnType, {
    message: 'ppn_type must be either EXCLUSIVE, INCLUSIVE or NONE',
  })
  ppn_type?: PPnType;

  @IsOptional()
  @IsNumber()
  pph_rate?: number; // example 2 for 2%

  @IsOptional()
  @IsNumber()
  ppn_rate?: number; // example 11 for 11%

  @IsOptional()
  @IsNumber()
  pph_amount?: number;

  @IsOptional()
  @IsNumber()
  ppn_amount?: number;

  @IsOptional()
  @IsNumber()
  shipping_cost?: number;
}

export class PurchasingDto extends PurchaseOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  supplier?: Types.ObjectId;
  @IsString()
  @IsDate()
  @IsNotEmpty()
  due_date?: Date;
}

export type PurchasingDetail =
  Purchasing & {
    _id: Types.ObjectId;
    total_purchase_price: Types.Decimal128;
    cost_difference: Types.Decimal128;
  };
