import { IsNotEmpty, IsString, IsDate, IsOptional, IsMongoId, IsNumber, IsArray, MinLength } from 'class-validator';
import { Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
export class PurchaseOrderDto {
  @IsOptional()
  @IsString()
  invoice_number?: string;

  @IsNotEmpty()
  @MinLength(1)
  @IsArray()
  @IsString({ each: true })
  invoice_attachments?: string[];
  
  @IsOptional()
  @IsNumber()
  additional_cost?: number;
  @IsOptional()
  reject_notes?: string;
}
export class PurchasingDto extends PurchaseOrderDto {
  @IsMongoId() // ✅ checks it's a valid ObjectId string
  @IsNotEmpty()
  supplier?: Types.ObjectId;
  @IsString()
  @IsDate()
  @IsNotEmpty()
  due_date?: Date;
}

export class ReceiveOrderDto extends PurchaseOrderDto {
  @IsOptional()
  @IsString()
  receive_notes?: string;
}

export class ListPurchasingItemsDTO extends PaginationDto {
  purchasing_id: Types.ObjectId
}