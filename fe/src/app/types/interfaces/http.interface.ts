import { IPaginationInput } from './common.interface';

export class IRequest {
  url: string = '';
  qParams?: any;
  spinner?: boolean = true;
}

export interface IReqMutation extends IRequest {
  body?: any
}

export interface IReqFORMDATA extends IRequest {
  data?: FormData
}

export interface IResponse<T> {
  message?: string;
  error_code?: string;
}

export interface IResList<T> extends IResponse<T> {
  list: T[];
  meta?: IPaginationInput;
}

export interface IResDetail<T> extends IResponse<T> {
  detail: T;
}