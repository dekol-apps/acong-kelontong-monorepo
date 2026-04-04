import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { BaseService } from "../../../../services/rest-api/base-service";
import { AlertService } from "../../../../shared/components/alert/alert-service";
import { ITableQueryData } from "../../../../shared/components/generic-table/generic-table";
import { Endpoint } from "../../../../types/constants/endpoint";
import { IResDetail, IResList } from "../../../../types/interfaces/http.interface";
import { ISale, ISaleItem, ISaleStockSummary } from "../../../../types/interfaces/sales.interface";

@Injectable({
  providedIn: 'root'
})
export class SaleService extends BaseService {
  constructor(private alert: AlertService) {
    super();
  }

  getSaleStocks(
    qParams: ITableQueryData
  ): Observable<IResList<ISaleStockSummary>> {
    return this.getRequest({ url: Endpoint.SALE_STOCK, qParams, spinner: false }).pipe(
      map((res: IResList<ISaleItem>) => {
        const grouped = res.list.reduce((acc, item) => {
          const productId = (typeof item.product === 'string' ? item.product : item.product?._id) as string;
          if (!acc[productId]) {
            acc[productId] = {
              product: productId,
              product_name: item.product_name,
              product_sku: item.product_sku,
              brand_name: item.brand_name,
              barcode: item.barcode,
              sale_price: item.sale_price,
              discount_percent: item.discount_percent,
              ppn_rate: item.ppn_rate,
              ppn_amount: item.ppn_amount,
              net_price: item.net_price,
              item_qty: 0,
              total_qty: 0
            };
          }
          acc[productId].item_qty += 1; // Since each SaleItem is 1 physical unit in the BE
          acc[productId].total_qty += 1;
          return acc;
        }, {} as Record<string, ISaleStockSummary>);

        return {
          meta: res.meta,
          list: Object.values(grouped)
        };
      })
    );
  }

  getSaleStocksByProductId(
    productId: string,
    qParams: ITableQueryData
  ): Observable<IResList<ISaleItem>> {
    return this.getRequest({
      url: Endpoint.SALE_STOCK_PRODUCT_ID(productId),
      qParams,
      spinner: false
    });
  }

  getSaleStockDetail(saleItemId: string): Observable<IResDetail<ISaleItem>> {
    return this.getRequest({
      url: Endpoint.SALE_STOCK_ITEM_ID(saleItemId),
      spinner: false
    });
  }

  addStock(payload: any): Observable<any> {
    return this.postRequest({
      url: Endpoint.SALE_STOCK,
      body: payload
    });
  }

  selling(payload: any): Observable<any> {
    return this.postRequest({
      url: Endpoint.SALE_SELLING,
      body: payload
    }).pipe(
      map((res) => {
        this.alert.success("Transaction success!");
        return res;
      })
    );
  }

  editSelling(id: string, payload: any): Observable<any> {
    return this.postRequest({
      url: Endpoint.SALE_SELLING_ID(id),
      body: payload
    }).pipe(
      map((res) => {
        this.alert.success("Sale updated successfully!");
        return res;
      })
    );
  }

  listSelling(qParams: ITableQueryData): Observable<IResList<ISale>> {
    return this.getRequest({
      url: Endpoint.SALE_SELLING,
      qParams,
      spinner: false
    }).pipe(
      map((res: IResList<ISale>) => {
        const list = res.list.map((item) => {
          // filter items to remove duplicates
          const items = item.items.reduce((acc, item) => {
            const existingItem = acc.find((i) => i.product.toString() === item.product.toString());
            if (!existingItem) {
              acc.push(item);
            }
            return acc;
          }, [] as ISaleItem[]);
          return {
            ...item,
            items,
          };
        });
        return { meta: res.meta, list };
      })
    );
  }

  getSellingDetail(id: string): Observable<IResDetail<ISale>> {
    return this.getRequest({
      url: Endpoint.SALE_SELLING_ID(id),
      spinner: false
    });
  }
}
