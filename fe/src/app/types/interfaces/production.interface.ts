import { IProduct } from "./catalogue.interface";

export enum ProductionEn {
  CREATE = 'CREATE',
  START = 'START',
  FINISH = 'FINISH',
}

export interface IProduction {
  _id?: string;
  product: IProduct;
  item_qty: number;
  price_per_item: number;
  operational_cost: number;
  grand_total_cost: number;
  ingredients: IProductionIngredient[];
  status: ProductionEn;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductionIngredient {
  product: IProduct;
  item_qty: number;
  total_cost: number;
}
