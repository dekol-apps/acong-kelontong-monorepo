import { Injectable } from '@angular/core';
import { BaseService } from '../rest-api/base-service';
import { Endpoint } from '../../types/constants/endpoint';
import { map, Observable } from 'rxjs';
import { IResDetail, IResList } from '../../types/interfaces/http.interface';
import { IAccounting } from '../../types/interfaces/finance.interface';
import { IPortofolio } from '../../pages/dashboard-v2/dashboard-v2';
import { FlowType } from '../../types/enums/common.enum';

export interface IAccountingListFilter {
  page?: number;
  size?: number;
  flow_type?: FlowType;
  order_type?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
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
    const qParams: any = {};
    if (filter?.page) qParams['page'] = filter.page;
    if (filter?.size) qParams['size'] = filter.size;
    if (filter?.flow_type) qParams['flow_type'] = filter.flow_type;
    if (filter?.order_type) qParams['order_type'] = filter.order_type;
    if (filter?.startDate) qParams['startDate'] = filter.startDate;
    if (filter?.endDate) qParams['endDate'] = filter.endDate;
    if (filter?.search) qParams['search'] = filter.search;
    if (filter?.sortBy) qParams['sortBy'] = filter.sortBy;
    if (filter?.sortDir) qParams['sortDir'] = filter.sortDir;

    return this.getRequest({ url: Endpoint.ACCOUNTING_HISTORY, qParams }).pipe(
      map((res: IResList<IAccounting>) => res)
    );
  }

  getDetail(id: string): Observable<IAccounting | undefined> {
    return this.getRequest({ url: Endpoint.ACCOUNTING_HISTORY_ID(id) }).pipe(
      map((res: IResDetail<IAccounting>) => res.detail)
    );
  }
}
