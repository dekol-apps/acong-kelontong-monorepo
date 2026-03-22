import { FlowType, OrderType } from '../enums/common.enum';
import { IProduct } from './catalogue.interface';

export interface IInventorySummary {
  _id: string; // Product ID
  product: string;
  product_name: string;
  inventory: string;
  item_qty: number;
  avg_landed_cost: string;
  total_landed_cost: string;
}

export interface IInventoryItem {
  _id?: string;
  product: IProduct;
  product_name: string;
  receive_date: Date;
  original_price: number;
  original_ppn_rate: number;
  landed_cost: number;
}

export interface IInventoryReconcileItem {
  product: string;
  item_qty: number;
  product_name?: string;
}

export interface IInventoryReconcileDto {
  description: string;
  items: IInventoryReconcileItem[];
}

export interface IInventoryMovementItem {
  product: IProduct;
  receive_date: Date;
  product_name: string;
  original_price: number;
  original_ppn_rate: number;
  original_ppn_amount: number;
  landed_cost: number;
}

export interface IInventoryMovement {
  _id: string;
  movement_type: FlowType;
  order_type: OrderType;
  items: IInventoryMovementItem[];
  description?: string;
  source_id?: string;
  createdAt: Date;
  updatedAt: Date;
}
