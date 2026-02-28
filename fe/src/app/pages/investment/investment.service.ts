import { Injectable } from '@angular/core';
import { Observable, map, catchError } from 'rxjs';
import { BaseService } from '../../services/rest-api/base-service';
import { AlertService } from '../../shared/components/alert/alert-service';
import { ITableQueryData } from '../../shared/components/generic-table/generic-table';
import { Endpoint } from '../../types/constants/endpoint';
import { InvestmentType, IPaginationInput } from '../../types/interfaces/common.interface';
import { IResList, IResDetail } from '../../types/interfaces/http.interface';
import { IInvestment } from '../../types/interfaces/investment.interface';

export interface IListInvestment extends ITableQueryData {
  investment_type: InvestmentType
}

@Injectable({
  providedIn: 'root'
})
export class InvestmentService extends BaseService {
  constructor(private alert: AlertService) {
    super();
  }

  getListInvestment(
    qParams: IListInvestment
  ): Observable<IResList<IInvestment>> {
    return this.getRequest({ url: Endpoint.INVESTMENT, qParams, spinner: false }).pipe(
      map((res: IResList<IInvestment>) => {
        const val = {
          meta: res?.meta as IPaginationInput,
          list: res?.list
        };
        return val;
      })
    );
  }

  editInvestment(
    investment_id,
    body: FormData //refers to IInvestmentDto
  ): Observable<IInvestment> {
    return this.putRequest({ url: Endpoint.INVESTMENT_ID(investment_id), body }).pipe(
      map((res: IResDetail<IInvestment>) => {
        return res.detail;
      })
    );
  }

  createInvestment(
    body: FormData //refers to IInvestmentDto
  ): Observable<IInvestment> {
    return this.postRequest({ url: Endpoint.INVESTMENT, body }).pipe(
      map((res: IResDetail<IInvestment>) => {
        return res.detail;
      })
    );
  }

  getDetailInvestment(itemId: string): Observable<IInvestment> {
    return this.getRequest({ url: Endpoint.INVESTMENT_ID(itemId) }).pipe(
      map((res: IResDetail<IInvestment>) => {
        return res.detail;
      })
    );
  }
}