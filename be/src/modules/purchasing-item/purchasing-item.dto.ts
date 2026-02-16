import { IsNotEmpty, IsNumber, IsOptional, IsMongoId, IsInt, Min } from 'class-validator';
import { Types } from 'mongoose';
export class ReceiveOrderItemDto {
  @IsMongoId() // ✅ checks it's a valid ObjectId string
  @IsNotEmpty()
  _id: Types.ObjectId;
  @IsOptional()
  @IsNumber()
  received_qty?: number;
}
export class PurchasingItemDto extends ReceiveOrderItemDto {
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
