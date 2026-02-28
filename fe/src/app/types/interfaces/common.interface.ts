import { IUser } from "./user.interface";

export interface IAuth {
  access_token: string;
  profile: IUser
}

export type TLogoutOption = 'all' | 'other' | 'current';

export interface ICheckboxOption { id: string; label: string; value: boolean }

export interface IDateRangeFilter { start_date?: Date, end_date?: Date }

export type TSortDir = 'asc' | 'desc' | '';
export interface ISort {
  sortBy?: string, sortDir?: TSortDir
}
export interface IPaginationOutput {
  page: number,
  size: number
}

export interface IPaginationInput extends IPaginationOutput {
  total: number,
  totalPages: number
}

export interface ISelectFilter {
  title: string;
  value?: ISelectValue;
  selectOptions: ISelectValue[];
}

export interface ISelectValue {
  label: string;
  value: any;
}

export type formType = 'new' | 'edit' | 'view';

export enum FlowType {
  IN = 'IN',
  OUT = 'OUT',
}

export enum InvestmentType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export enum ApprovalType {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum OrderType {
  PURCHASING = 'PURCHASING',
  SALE = 'SALE',
  EXPENSE = 'EXPENSE',
  ADJUSTMENT = 'ADJUSTMENT',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  PRODUCTION = 'PRODUCTION',
  OPERATION = 'OPERATION',
  ELSE = 'ELSE'
}

export enum CurrencyEn {
  IDR = 'IDR',
  USD = 'USD',
}

export enum PPnType {
  EXCLUSIVE = 'EXCLUSIVE', INCLUSIVE = 'INCLUSIVE', NONE = 'NONE'
}

export enum PPhType {
  PPh23 = 'PPh23',  // Services, rental, consulting
  PPh22 = 'PPh22',  // Goods purchase, imports, pengadaaan
  PPh4_2 = 'PPh4_2', // Construction, land/building rental
  NONE = 'NONE'
}