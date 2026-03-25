import { Injectable } from '@angular/core';
import { BaseService } from '../rest-api/base-service';
import { Endpoint } from '../../types/constants/endpoint';
import { map, Observable } from 'rxjs';
import { IResDetail, IResList } from '../../types/interfaces/http.interface';
import { IAccounting } from '../../types/interfaces/finance.interface';
import { IPortofolio } from '../../pages/dashboard-v2/dashboard-v2';
import { FlowType } from '../../types/enums/common.enum';
import { ITableQueryData } from '../../shared/components/generic-table/generic-table';

export interface IAccountingListFilter extends ITableQueryData {
  flow_type?: FlowType;
  order_type?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountingService extends BaseService {

  getPortfolio(): Observable<IPortofolio | undefined> {
    return this.getRequest({ url: Endpoint.ACCOUNTING }).pipe(
      map((res: IResDetail<IPortofolio>) => res.detail)
    );
  }

  listHistory(filter?: IAccountingListFilter): Observable<IResList<IAccounting>> {
    return this.getRequest({ url: Endpoint.ACCOUNTING_HISTORY, qParams: filter }).pipe(
      map((res: IResList<IAccounting>) => res)
    );
  }

  getDetail(id: string): Observable<IAccounting | undefined> {
    return this.getRequest({ url: Endpoint.ACCOUNTING_HISTORY_ID(id) }).pipe(
      map((res: IResDetail<IAccounting>) => res.detail)
    );
  }
}
