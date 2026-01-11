import { IsNotEmpty, IsDate, IsNumber, IsOptional, IsMongoId, IsInt, Min } from 'class-validator';
import { Types } from 'mongoose';
export class PurchasOrderItemDto {
  @IsOptional()
  @IsNumber()
  recieved_qty?: number;
  @IsDate()
  exp_date?: Date;
}
export class PurchasingItemDto extends PurchasOrderItemDto {
  @IsMongoId() // ✅ checks it's a valid ObjectId string
  @IsNotEmpty()
  purchase_order: Types.ObjectId;
  @IsMongoId() // ✅ checks it's a valid ObjectId string
  @IsNotEmpty()
  product: Types.ObjectId;
  @IsInt()
  @Min(1)
  purchase_qty: number;
  @IsInt()
  @Min(1)
  purchase_price: number;
}
