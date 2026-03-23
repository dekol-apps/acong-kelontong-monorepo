import { IsNotEmpty, IsString, IsDate, IsOptional, IsArray, IsEnum, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';
import { IsObjectId } from 'src/global/is-object-id.decorator';
import { Types } from 'mongoose';
import { ApprovalType, PPnType } from 'src/types/interfaces';
import { Purchasing, PurchasingEn } from './purchasing.schema';
import { PaginationDto } from 'src/global/global.dto';

export class ListPurchasingDto extends PaginationDto {
  @IsOptional()
  @IsEnum(PurchasingEn)
  status?: PurchasingEn;
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
  @IsDecimal()
  payment_realization: Types.Decimal128;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(PPnType, {
    message: 'ppn_type must be either EXCLUSIVE, INCLUSIVE or NONE',
  })
  ppn_type?: PPnType;

  @IsOptional()
  @IsDecimal()
  ppn_amount?: Types.Decimal128;

  @IsOptional()
  @IsDecimal()
  shipping_cost?: Types.Decimal128;
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
