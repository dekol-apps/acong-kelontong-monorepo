import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { BaseService } from "../../../../services/rest-api/base-service";
import { AlertService } from "../../../../shared/components/alert/alert-service";
import { ITableQueryData } from "../../../../shared/components/generic-table/generic-table";
import { Endpoint } from "../../../../types/constants/endpoint";
import { IResDetail, IResList } from "../../../../types/interfaces/http.interface";
import { IInventoryItem, IInventoryMovement, IInventoryMovementItem, IInventorySummary } from "../../../../types/interfaces/inventory.interface";


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

  getInventoryMovements(qParams: ITableQueryData): Observable<IResList<IInventoryMovement>> {
    return this.getRequest({ url: Endpoint.INVENTORY_MOVEMENT, qParams, spinner: false }).pipe(
      map((res: IResList<IInventoryMovement>) => {
        const list = res.list.map((item) => {
          // filter items to remove duplicates
          const items = item.items.reduce((acc, item) => {
            const existingItem = acc.find((i) => i.product.toString() === item.product.toString());
            if (!existingItem) {
              acc.push(item);
            }
            return acc;
          }, [] as IInventoryMovementItem[]);
          return {
            ...item,
            items,
          };
        });
        return { meta: res.meta, list };
      })
    );
  }

  getInventoryMovementDetail(movementId: string): Observable<IResDetail<IInventoryMovement>> {
    return this.getRequest({ url: Endpoint.INVENTORY_MOVEMENT_ID(movementId), spinner: false });
  }

  moveInventory(body: any): Observable<IResDetail<IInventoryMovement>> {
    return this.postRequest({ url: Endpoint.INVENTORY_MOVEMENT, body });
  }
}
