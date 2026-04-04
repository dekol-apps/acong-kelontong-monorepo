import { Injectable } from '@angular/core';
import { BaseService } from '../../../services/rest-api/base-service';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { catchError, map, Observable, of } from 'rxjs';
import { Endpoint } from '../../../types/constants/endpoint';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { IResDetail, IResList } from '../../../types/interfaces/http.interface';
import { ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { IProduct } from '../../../types/interfaces/catalogue.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseService {
  constructor(private alert: AlertService) {
    super();
  }

  getProducts(
    qParams: ITableQueryData
  ): Observable<IResList<IProduct>> {
    return this.getRequest({ url: Endpoint.PRODUCT, qParams, spinner: false }).pipe(
      map((res: IResList<IProduct>) => {
        const val = {
          meta: res?.meta as IPaginationInput,
          list: res?.list
        };
        return val;
      })
    );
  }

  createProduct(
    body: IProduct
  ): Observable<IResDetail<IProduct>> {
    return this.postRequest({ url: Endpoint.PRODUCT, body }).pipe(
      map((res: IResDetail<IProduct>) => {
        return res;
      })
    );
  }

  editProduct(
    product_id: string,
    body: { role: string }
  ): Observable<IResDetail<IProduct>> {
    return this.putRequest({ url: Endpoint.PRODUCT_ID(product_id), body }).pipe(
      map((res: IResDetail<IProduct>) => {
        return res;
      })
    );
  }

  getProductDetail(product_id: string): Observable<IResDetail<IProduct>> {
    return this.getRequest({ url: Endpoint.PRODUCT_ID(product_id) }).pipe(
      map((res: IResDetail<IProduct>) => {
        return res;
      })
    );
  }

  deleteProduct(product_id: string): Observable<IProduct> {
    return this.deleteRequest({ url: Endpoint.PRODUCT_ID(product_id) }).pipe(
      map((res: IResDetail<IProduct>) => {
        return res.detail;
      })
    );
  }

}
