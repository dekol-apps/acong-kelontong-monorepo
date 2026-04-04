export interface IBrand {
  _id?: string;
  brand_name: string;
  brand_description?: string;
} 

export interface IProduct {
  _id?: string;
  product_name: string;
  product_sku?: string;
  product_description?: string;
  unit_of_measure: string,
  barcode?: string, 
  brand: IBrand
} 