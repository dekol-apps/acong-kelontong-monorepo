import { IsNotEmpty, IsNumber, IsOptional, Min, IsInt } from 'class-validator';
import { IsObjectId } from 'src/global/is-object-id.decorator';
import { Types } from 'mongoose';
import { IsMoney } from 'src/global/is-money.decorator';
export class ReceiveOrderItemDto {
  @IsObjectId() // checks it's a valid ObjectId string
  @IsNotEmpty()
  _id: string;
  @IsOptional()
  @IsNumber()
  received_qty?: number;
}
export class PurchasingItemDto {
  @IsObjectId() // checks it's a valid ObjectId string
  @IsNotEmpty()
  purchase_order: string;
  @IsObjectId() // checks it's a valid ObjectId string
  @IsNotEmpty()
  product: string;
  @IsInt()
  @Min(1)
  purchase_qty: number;
  @IsMoney()
  @IsNotEmpty()
  purchase_price: Types.Decimal128;
}
