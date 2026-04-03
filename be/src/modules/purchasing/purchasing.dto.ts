import { IsNotEmpty, IsString, IsDate, IsOptional, IsArray, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { IsObjectId } from 'src/global/is-object-id.decorator';
import { Types } from 'mongoose';
import { ApprovalType, PPnType } from 'src/types/interfaces';
import { PaymentStatusEn, Purchasing, PurchasingEn, ValidatePaymentResult } from './purchasing.schema';
import { PaginationDto } from 'src/global/global.dto';
import { IsMoney } from 'src/global/is-money.decorator';

export class ListPurchasingDto extends PaginationDto {
  @IsOptional()
  @IsEnum(PurchasingEn)
  status?: PurchasingEn;

  @IsOptional()
  @IsEnum(PaymentStatusEn)
  payment_status?: PaymentStatusEn;
}

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
  @IsEnum(PaymentStatusEn, {
    message: 'payment_status must be either UNPAID, PARTIAL, or PAID',
  })
  payment_status?: PaymentStatusEn;

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
  @IsMoney()
  payment_realization?: Types.Decimal128;

  @IsOptional()
  @IsMoney()
  paid_total?: Types.Decimal128;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(PPnType, {
    message: 'ppn_type must be either EXCLUSIVE, INCLUSIVE or NONE',
  })
  ppn_type?: PPnType;

  @IsOptional()
  @IsMoney()
  ppn_amount?: Types.Decimal128;

  @IsOptional()
  @IsMoney()
  shipping_cost?: Types.Decimal128;

  @IsOptional()
  @IsNumber()
  ppn_rate?: number;
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
    predicted_additional_cost: Types.Decimal128;
    validation: ValidatePaymentResult;
  };
