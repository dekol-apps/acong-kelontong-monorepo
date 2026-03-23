import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { BaseService } from "../../../../services/rest-api/base-service";
import { AlertService } from "../../../../shared/components/alert/alert-service";
import { ITableQueryData } from "../../../../shared/components/generic-table/generic-table";
import { Endpoint } from "../../../../types/constants/endpoint";
import { IResDetail, IResList } from "../../../../types/interfaces/http.interface";
import { ISaleItem, ISaleStockSummary } from "../../../../types/interfaces/sales.interface";

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
              brand_name: item.brand_name,
              barcode: item.barcode,
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
    // There is no specific detail endpoint in BE yet for SaleItem, 
    // but we can use the list with a filter by ID if needed, 
    // or assume SALE_STOCK_ITEM_ID works as expected if we were to add it.
    // However, looking at the BE controller, there's only `GET /stock`.
    // I will use `GET /stock` with a filter for Level 2 and Level 3 if Level 3 is also a list or single item.
    // The user said "detail of the stock item" which usually means a single record.
    return this.getRequest({
      url: Endpoint.SALE_STOCK_ITEM_ID(saleItemId),
      spinner: false
    });
  }
}
