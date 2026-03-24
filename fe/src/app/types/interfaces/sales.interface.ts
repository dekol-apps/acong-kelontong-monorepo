import { IProduct } from "./catalogue.interface";

export interface ISale {
  _id?: string;
  sale_number: string;
  customer_name?: string;
  items: ISaleItem[];
  total_discount: string;
  total_cogs: string;
  ppn_rate: number;
  total_before_tax: string;
  total_ppn: string;
  grand_total: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISaleItem {
  _id?: string;
  product: string | IProduct;
  product_name: string;
  brand_name: string;
  barcode: string;
  original_price: string;
  original_ppn_rate: number;
  original_ppn_amount: string;
  sale_price: string;
  discount_percent: number;
  discount_amount: string;
  cogs: string;

  // Mapped fields from FE service
  ppn_rate?: number;
  ppn_amount?: string;
  net_price?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISaleStockSummary {
  product: string;
  product_name: string;
  brand_name: string;
  barcode: string;
  sale_price: string;
  discount_percent: number;
  item_qty: number;
  total_qty: number;
}
