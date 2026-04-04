import { Injectable } from '@angular/core';
import { BaseService } from '../../../services/rest-api/base-service';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { catchError, map, Observable, of } from 'rxjs';
import { Endpoint } from '../../../types/constants/endpoint';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { IResDetail, IResList } from '../../../types/interfaces/http.interface';
import { ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { ISupplier } from '../../../types/interfaces/procurement.interface';

@Injectable({
  providedIn: 'root'
})
export class SupplierService extends BaseService {
  constructor(private alert: AlertService) {
    super();
  }

  getSuppliers(
    qParams: ITableQueryData
  ): Observable<IResList<ISupplier>> {
    return this.getRequest({ url: Endpoint.SUPPLIER, qParams, spinner: false }).pipe(
      map((res: IResList<ISupplier>) => {
        const val = {
          meta: res?.meta as IPaginationInput,
          list: res?.list
        };
        return val;
      })
    );
  }

  createSupplier(
    body: ISupplier
  ): Observable<ISupplier> {
    return this.postRequest({ url: Endpoint.SUPPLIER, body }).pipe(
      map((res: IResDetail<ISupplier>) => {
        return res.detail;
      })
    );
  }

  editSupplier(
    supplier_id: string,
    body: ISupplier
  ): Observable<ISupplier> {
    return this.putRequest({ url: Endpoint.SUPPLIER_ID(supplier_id), body }).pipe(
      map((res: IResDetail<ISupplier>) => {
        return res.detail;
      })
    );
  }

  getSupplierDetail(supplier_id: string): Observable<ISupplier> {
    return this.getRequest({ url: Endpoint.SUPPLIER_ID(supplier_id) }).pipe(
      map((res: IResDetail<ISupplier>) => {
        return res.detail;
      })
    );
  }

  deleteSupplier(supplier_id: string): Observable<ISupplier> {
    return this.deleteRequest({ url: Endpoint.SUPPLIER_ID(supplier_id) }).pipe(
      map((res: IResDetail<ISupplier>) => {
        return res.detail;
      })
    );
  }

}

