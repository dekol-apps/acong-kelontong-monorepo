import { IProduct } from "./catalogue.interface";

export interface ISale {
  _id?: string;
  sale_number: string;
  customer_name?: string;
  items: ISaleItem[];
  total_price: { $numberDecimal: string };
  createdAt?: Date;
}

export interface ISaleItem {
  _id?: string;
  product: IProduct;
  qty: number;
  price: { $numberDecimal: string };
}
