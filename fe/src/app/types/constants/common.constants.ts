import { ISelectValue } from '../interfaces/common.interface';

export const sessionDays = 7;
export const sessionMinutes = 15;
export const salts = 10
export const errCodes = {
  authGuard: 'GUARD_401'
}

export const DATE_FORMAT = 'dd/MMM/yyyy';
export const CURRENCY_FORMAT = 'IDR';

export enum SORT_DIR {
  ASC = 'asc',
  DESC = 'desc',
  NONE = ''
}

export const UnitOfMeasure = ["G", "KG", "ML", "L", "PCS", "BOX"];
export type TUOM = 'G' | 'KG' | 'ML' | 'L' | 'PCS' | 'BOX'

export const TenMegaByte: number = 10 * 1024 * 1024;

export const PPHTYPES: ISelectValue[] = [
  {
    value: 'PPh23', label: 'PPh 23',
  },
  {
    value: 'PPh22', label: 'PPh 22',
  },
  {
    value: 'PPh4_2', label: 'PPh 4(2)',
  },
  {
    value: 'NONE', label: 'None',
  }
]

export const PPNTYPES: ISelectValue[] = [
  {
    value: 'EXCLUSIVE', label: 'In-Price',
  },
  {
    value: 'INCLUSIVE', label: 'Outside-Price',
  },
  {
    value: 'NONE', label: 'None',
  }
]