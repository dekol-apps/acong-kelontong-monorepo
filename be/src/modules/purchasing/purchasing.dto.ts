import { IsNotEmpty, IsString, IsDate, IsOptional, IsMongoId, IsNumber, IsArray, MinLength, IsEnum, IsInt } from 'class-validator';
import mongoose, { Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { ApprovalType } from 'src/types/interfaces';
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
  invoice_number?: string;

  @IsNotEmpty()
  @MinLength(1)
  @IsArray()
  @IsString({ each: true })
  purchasing_attachments?: string[];

  @IsOptional()
  @IsInt()
  additional_cost?: mongoose.Schema.Types.Decimal128;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PurchasingDto extends PurchaseOrderDto {
  @IsMongoId() // ✅ checks it's a valid ObjectId string
  @IsNotEmpty()
  supplier?: Types.ObjectId;
  @IsString()
  @IsDate()
  @IsNotEmpty()
  due_date?: Date;
  @IsOptional()
  reject_notes?: string;
}

export class ListPurchasingItemsDTO extends PaginationDto {
  purchasing_id: Types.ObjectId
}

export type PurchasingDetail =
  Purchasing & {
    _id: Types.ObjectId;
    total_purchase_price: mongoose.Schema.Types.Decimal128;
  };
