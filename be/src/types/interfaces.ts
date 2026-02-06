import type { Response } from 'express';
import { RoleDocument } from 'src/modules/role/role.schema';
import { Types } from 'mongoose';

export interface IRefreshTokenPayload {
  id: Types.ObjectId;
  id0: Types.ObjectId;
}

export interface ITokenPayload extends IRefreshTokenPayload {
  role: RoleDocument;
}

export interface GlobalVar extends ITokenPayload {
  userAgent: string;
  accesToken: string;
}

export type TModules =  //This is a list of API Endpoint permission
  'investment.view' | 'investment.create' | 'investment.edit' | 'investment.delete' |
  'approval.view' | 'approval.create' | 'approval.edit' | 'approval.delete' |
  'inventory.view' | 'inventory.create' | 'inventory.edit' | 'inventory.delete' |
  'showcase.view' | 'showcase.create' | 'showcase.edit' | 'showcase.delete' |
  'purchasing.view' | 'purchasing.create' | 'purchasing.edit' | 'purchasing.delete' |
  'cashier.view' | 'cashier.create' | 'cashier.edit' | 'cashier.delete' |
  'product.view' | 'product.create' | 'product.edit' | 'product.delete' |
  'brand.view' | 'brand.create' | 'brand.edit' | 'brand.delete' |
  'supplier.view' | 'supplier.create' | 'supplier.edit' | 'supplier.delete' |
  'capital.view' | 'capital.create' | 'capital.edit' | 'capital.delete' |
  'cashflow.view' | 'cashflow.create' | 'cashflow.edit' | 'cashflow.delete' |
  'expenses.view' | 'expenses.create' | 'expenses.edit' | 'expenses.delete' |
  'user.view' | 'user.create' | 'user.edit' | 'user.delete' |
  'role.view' | 'role.create' | 'role.edit' | 'role.delete';

export type TLogoutOption = 'all' | 'other' | 'current';

export interface IListRes<T> {
  data: T[];
  meta?: IPaginationRes
}
export interface IPaginationRes {
  total: number;
  totalPages: number;
  page: number;
  size: number;
}
export interface IResponse {
  message?: string;
  list?: object[];
  detail?: object;
  error_code?: string;
  meta?: IPaginationRes
}

export interface IBaseResponse {
  res?: Response;
  err?: any;
  option?: IResponse;
}

export type TOneOrMany<T> = T | T[];

export enum FlowType {
  IN = 'IN',
  OUT = 'OUT',
}

export enum InvestmentType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}


export enum OrderType {
  PURCHASING = 'PURCHASING',
  SALE = 'SALE',
  EXPENSE = 'EXPENSE',
  ADJUSTMENT = 'ADJUSTMENT',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export enum CurrencyEn {
  IDR = 'IDR',
  USD = 'USD',
}