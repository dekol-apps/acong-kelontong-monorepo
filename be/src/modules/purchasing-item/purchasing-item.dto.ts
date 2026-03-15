import { IsNotEmpty, IsNumber, IsOptional, IsMongoId, Min, IsInt } from 'class-validator';
export class ReceiveOrderItemDto {
  @IsMongoId() // checks it's a valid ObjectId string
  @IsNotEmpty()
  _id: string;
  @IsOptional()
  @IsNumber()
  received_qty?: number;
}
export class PurchasingItemDto {
  @IsMongoId() // checks it's a valid ObjectId string
  @IsNotEmpty()
  purchase_order: string;
  @IsMongoId() // checks it's a valid ObjectId string
  @IsNotEmpty()
  product: string;
  @IsInt()
  @Min(1)
  purchase_qty: number;
  @IsNumber()
  @Min(1)
  purchase_price: number;
}
