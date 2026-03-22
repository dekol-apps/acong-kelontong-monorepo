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