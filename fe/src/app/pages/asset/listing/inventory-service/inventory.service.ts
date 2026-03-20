import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BaseService } from "../../../../services/rest-api/base-service";
import { AlertService } from "../../../../shared/components/alert/alert-service";
import { ITableQueryData } from "../../../../shared/components/generic-table/generic-table";
import { Endpoint } from "../../../../types/constants/endpoint";
import { IResDetail, IResList } from "../../../../types/interfaces/http.interface";
import { IInventoryItem, IInventorySummary } from "../../../../types/interfaces/inventory.interface";


@Injectable({
  providedIn: 'root'
})
export class InventoryService extends BaseService {
  constructor(private alert: AlertService) {
    super();
  }

  getInventoryItems(
    qParams: ITableQueryData
  ): Observable<IResList<IInventorySummary>> {
    return this.getRequest({ url: Endpoint.INVENTORY_ITEM, qParams, spinner: false });
  }

  getInventoryItemsByProductId(
    productId: string,
    qParams: ITableQueryData
  ): Observable<IResList<IInventorySummary>> {
    return this.getRequest({ url: Endpoint.INVENTORY_ITEM_PRODUCT_ID(productId), qParams, spinner: false });
  }

  getInventoryDetail(inventoryId: string): Observable<IResDetail<IInventoryItem>> {
    return this.getRequest({ url: Endpoint.INVENTORY_ITEM_ID(inventoryId), spinner: false });
  }
}
