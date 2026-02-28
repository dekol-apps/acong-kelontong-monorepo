import { Injectable } from '@angular/core';
import { Observable, map, catchError } from 'rxjs';
import { BaseService } from '../../services/rest-api/base-service';
import { AlertService } from '../../shared/components/alert/alert-service';
import { ITableQueryData } from '../../shared/components/generic-table/generic-table';
import { Endpoint } from '../../types/constants/endpoint';
import { IPaginationInput } from '../../types/interfaces/common.interface';
import { IResList, IResDetail } from '../../types/interfaces/http.interface';
import { IInvestment } from '../../types/interfaces/investment.interface';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService extends BaseService {
  constructor(private alert: AlertService) {
    super();
  }

  getListDeposit(
    qParams: ITableQueryData
  ): Observable<IResList<IInvestment>> {
    return this.getRequest({ url: Endpoint.PURCHASING, qParams, spinner: false }).pipe(
      map((res: IResList<IInvestment>) => {
        const val = {
          meta: res?.meta as IPaginationInput,
          list: res?.list
        };
        return val;
      }),
      catchError((err) => {
        console.error(err);
        this.alert.error('Cannot get list investment');
        throw new Error(err);
      })
    ) as any;
  }

  editDeposit(
    body: FormData //refers to IInvestmentDto
  ): Observable<IInvestment> {
    return this.putRequest({ url: Endpoint.PURCHASING, body }).pipe(
      map((res: IResDetail<IInvestment>) => {
        return res.detail;
      }),
      catchError((err) => {
        console.error(err);
        this.alert.error('Cannot edit deposit');
        throw new Error(err);
      })
    ) as any;
  }

  createDeposit(
    body: FormData //refers to IInvestmentDto
  ): Observable<IInvestment> {
    return this.postRequest({ url: Endpoint.PURCHASING, body }).pipe(
      map((res: IResDetail<IInvestment>) => {
        return res.detail;
      }),
      catchError((err) => {
        console.error(err);
        this.alert.error('Cannot create deposit');
        throw new Error(err);
      })
    ) as any;
  }

  getDetailDeposit(itemId: string): Observable<IInvestment> {
    return this.getRequest({ url: Endpoint.PURCHASING_ID(itemId) }).pipe(
      map((res: IResDetail<IInvestment>) => {
        return res.detail;
      }),
      catchError((err) => {
        console.error(err);
        this.alert.error('Cannot get deposit detail');
        throw new Error(err);
      })
    ) as any;
  }

  getListWithdrawal(
    qParams: ITableQueryData
  ): Observable<IResList<IInvestment>> {
    return this.getRequest({ url: Endpoint.PURCHASING, qParams, spinner: false }).pipe(
      map((res: IResList<IInvestment>) => {
        const val = {
          meta: res?.meta as IPaginationInput,
          list: res?.list
        };
        return val;
      }),
      catchError((err) => {
        console.error(err);
        this.alert.error('Cannot get list withdrawal');
        throw new Error(err);
      })
    ) as any;
  }

  createWithdrawal(
    body: FormData //refers to IInvestmentDto
  ): Observable<IInvestment> {
    return this.postRequest({ url: Endpoint.PURCHASING, body }).pipe(
      map((res: IResDetail<IInvestment>) => {
        return res.detail;
      }),
      catchError((err) => {
        console.error(err);
        this.alert.error('Cannot create withdrawal');
        throw new Error(err);
      })
    ) as any;
  }

  editWithdrawal(
    body: FormData
  ): Observable<IInvestment> {
    return this.putRequest({ url: Endpoint.PURCHASING, body }).pipe(
      map((res: IResDetail<IInvestment>) => {
        return res.detail;
      }),
      catchError((err) => {
        console.error(err);
        this.alert.error('Cannot edit withdrawal');
        throw new Error(err);
      })
    ) as any;
  }

  getDetailWithdrawal(itemId: string): Observable<IInvestment> {
    return this.getRequest({ url: Endpoint.PURCHASING_ID(itemId) }).pipe(
      map((res: IResDetail<IInvestment>) => {
        return res.detail;
      }),
      catchError((err) => {
        console.error(err);
        this.alert.error('Cannot get withdrawal detail');
        throw new Error(err);
      })
    ) as any;
  }
}