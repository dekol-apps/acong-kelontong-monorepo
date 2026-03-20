import { ITableQueryData } from '../../shared/components/generic-table/generic-table';
import { IProduct } from './catalogue.interface';
import { PPhType, PPnType } from './common.interface';
import { InventoryEn } from './supplies.interface';

export interface ISupplier {
  _id?: string;
  supplier_name: string;
  supplier_phone?: string;
  supplier_email?: string;
}

export enum PurchasingEn {
  CREATE = 'CREATE',
  REQUEST = 'REQUEST',
  REJECT = 'REJECT',
  APPROVE = 'APPROVE',
  PROCESS = 'PROCESS',
  RECEIVE = 'RECEIVE',
  COMPLETE = 'COMPLETE',
  DROP = 'DROP',
  EXPIRED = 'EXPIRED',
}
export interface IPurchasingDto {
  supplier?: string;
  due_date?: Date;
  invoice_number?: string;
  invoice_photo?: string;
}
export interface IPurchasingItemDto {
  purchase_order: string;
  product: string;
  exp_date: string;
  purchase_qty: number;
  recieved_qty: number;
  purchase_price: number;
  sell_price: number;
}
export interface IProcessPurchaseOrderDto {
  invoice_number?: string;
  invoice_photo?: string;
  purchase_item: IPurchasingItemDto[];
}
export interface ReceiveOrderItemDto {
  purchase_item: string;
  status?: InventoryEn;
}
export interface IPurchasing {
  _id?: string;
  items?: IPurchasingItem[];
  supplier?: ISupplier;
  supplier_name?: string;
  due_date?: Date;
  status?: PurchasingEn;
  ppn_facture_number?: string;
  invoice_number?: string;
  purchasing_attachments?: string[];
  notes?: string; // for example: notes for additional cost
  reject_notes?: string; // APPROVAL step
  completed_date?: Date; // Receive order step
  createdAt?: Date;
  shipping_cost?: string;
  payment_realization?: string;
  cost_difference?: string;
  total_purchase_price?: string;
  ppn_type?: PPnType;
  ppn_rate?: number;
  ppn_amount?: string;
}
export interface IPurchasingItem {
  _id?: string;
  product?: IProduct;
  purchase_order?: IPurchasing;
  product_name?: string;
  supplier_name?: string;
  purchase_qty?: number;
  received_qty?: number;
  purchase_price?: string;
  sell_price?: string;
  exp_date?: Date;
}
export interface IListPurchasingItemsDTO extends ITableQueryData {
  purchasing_id: string;
}