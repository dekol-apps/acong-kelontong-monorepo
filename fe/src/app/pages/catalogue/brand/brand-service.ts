import { Injectable } from '@angular/core';
import { BaseService } from '../../../services/rest-api/base-service';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { catchError, map, Observable, of } from 'rxjs';
import { Endpoint } from '../../../types/constants/endpoint';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { IResDetail, IResList } from '../../../types/interfaces/http.interface';
import { ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { IBrand } from '../../../types/interfaces/catalogue.interface';

@Injectable({
  providedIn: 'root'
})
export class BrandService extends BaseService {
  constructor(private alert: AlertService) {
    super();
  }

  getBrands(
    qParams: ITableQueryData
  ): Observable<IResList<IBrand>> {
    return this.getRequest({ url: Endpoint.BRAND, qParams, spinner: false }).pipe(
      map((res: IResList<IBrand>) => {
        const val = {
          meta: res?.meta as IPaginationInput,
          list: res?.list
        };
        return val;
      })
    );
  }

  createBrand(
    body: IBrand
  ): Observable<IBrand> {
    return this.postRequest({ url: Endpoint.BRAND, body }).pipe(
      map((res: IResDetail<IBrand>) => {
        return res.detail;
      })
    );
  }

  editBrand(
    brand_id: string,
    body: IBrand
  ): Observable<IBrand> {
    return this.putRequest({ url: Endpoint.BRAND_ID(brand_id), body }).pipe(
      map((res: IResDetail<IBrand>) => {
        return res.detail;
      })
    );
  }

  getBrandDetail(brand_id: string): Observable<IBrand> {
    return this.getRequest({ url: Endpoint.BRAND_ID(brand_id) }).pipe(
      map((res: IResDetail<IBrand>) => {
        return res.detail;
      })
    );
  }

  deleteBrand(brand_id: string): Observable<IBrand> {
    return this.deleteRequest({ url: Endpoint.BRAND_ID(brand_id) }).pipe(
      map((res: IResDetail<IBrand>) => {
        return res.detail;
      })
    );
  }

}
