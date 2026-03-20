import { IsNotEmpty, IsString, IsDate, IsOptional, IsArray, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { IsObjectId } from 'src/global/is-object-id.decorator';
import { Types } from 'mongoose';
import { ApprovalType, PPnType } from 'src/types/interfaces';
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

export class PurchaseOrderDto {
  @IsOptional()
  @IsString()
  ppn_facture_number?: string;

  @IsOptional()
  @IsString()
  invoice_number?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  purchasing_attachments?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  payment_realization?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(PPnType, {
    message: 'ppn_type must be either EXCLUSIVE, INCLUSIVE or NONE',
  })
  ppn_type?: PPnType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ppn_amount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  shipping_cost?: number;
}

export class PurchasingDto extends PurchaseOrderDto {
  @IsOptional()
  @IsObjectId()
  supplier?: Types.ObjectId;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  due_date?: Date;
}

export type PurchasingDetail =
  Purchasing & {
    _id: Types.ObjectId;
    total_purchase_price: Types.Decimal128;
    cost_difference: Types.Decimal128;
  };
