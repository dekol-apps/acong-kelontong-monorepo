import { Injectable } from '@angular/core';
import { BaseService } from '../../../services/rest-api/base-service';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { catchError, map, Observable, of } from 'rxjs';
import { Endpoint } from '../../../types/constants/endpoint';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { IResDetail, IResList } from '../../../types/interfaces/http.interface';
import { ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { IPurchasing, IPurchasingItem, IPurchasingItemDto } from '../../../types/interfaces/procurement.interface';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService extends BaseService {
  constructor(private alert: AlertService) {
    super();
  }

  getPurchasings(
    qParams: ITableQueryData
  ): Observable<IResList<IPurchasing>> {
    return this.getRequest({ url: Endpoint.PURCHASING, qParams, spinner: false }).pipe(
      map((res: IResList<IPurchasing>) => {
        const val = {
          meta: res?.meta as IPaginationInput,
          list: res?.list
        };
        return val;
      })
    );
  }

  createPurchasing(
    body: FormData //refers to IPurchasingDto
  ): Observable<IPurchasing> {
    return this.postRequest({ url: Endpoint.PURCHASING, body }).pipe(
      map((res: IResDetail<IPurchasing>) => {
        return res.detail;
      })
    );
  }

  editPurchasing(
    purchasing_id: string,
    body: FormData //refers to IPurchasingDto
  ): Observable<IPurchasing> {
    return this.putRequest({ url: Endpoint.PURCHASING_ID(purchasing_id), body }).pipe(
      map((res: IResDetail<IPurchasing>) => {
        return res.detail;
      })
    );
  }

  getPurchasingDetail(purchasing_id: string): Observable<IPurchasing> {
    return this.getRequest({ url: Endpoint.PURCHASING_ID(purchasing_id) }).pipe(
      map((res: IResDetail<IPurchasing>) => {
        return res.detail;
      })
    );
  }

  deletePurchasing(purchasing_id: string): Observable<IPurchasing> {
    return this.deleteRequest({ url: Endpoint.PURCHASING_ID(purchasing_id) }).pipe(
      map((res: IResDetail<IPurchasing>) => {
        return res.detail;
      })
    );
  }

  getPurchasingItems(
    purchasing_id: string,
    qParams: ITableQueryData
  ): Observable<IResList<IPurchasingItem>> {
    return this.getRequest({ url: Endpoint.PURCHASING_ID(purchasing_id) + '/items', qParams, spinner: false }).pipe(
      map((res: IResList<IPurchasingItem>) => {
        const val = {
          meta: res?.meta as IPaginationInput,
          list: res?.list
        };
        return val;
      })
    );
  }

  createPurchaseItem(
    body: IPurchasingItemDto
  ): Observable<IPurchasingItem> {
    return this.postRequest({ url: Endpoint.PURCHASING_ITEM, body }).pipe(
      map((res: IResDetail<IPurchasingItem>) => {
        return res.detail;
      })
    );
  }

  editPurchaseItem(
    purchase_item_id: string,
    body: IPurchasingItemDto
  ): Observable<IPurchasingItem> {
    return this.putRequest({ url: Endpoint.PURCHASING_ITEM_ID(purchase_item_id), body }).pipe(
      map((res: IResDetail<IPurchasingItem>) => {
        return res.detail;
      })
    );
  }

  getPurchaseItemDetail(purchase_item_id: string): Observable<IPurchasingItem> {
    return this.getRequest({ url: Endpoint.PURCHASING_ITEM_ID(purchase_item_id) }).pipe(
      map((res: IResDetail<IPurchasingItem>) => {
        return res.detail;
      })
    );
  }

  deletePurchaseItem(purchase_item_id: string): Observable<IPurchasingItem> {
    return this.deleteRequest({ url: Endpoint.PURCHASING_ITEM_ID(purchase_item_id) }).pipe(
      map((res: IResDetail<IPurchasingItem>) => {
        return res.detail;
      })
    );
  }
}

