import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BaseService } from "../../../../services/rest-api/base-service";
import { ITableQueryData } from "../../../../shared/components/generic-table/generic-table";
import { Endpoint } from "../../../../types/constants/endpoint";
import { IResDetail, IResList } from "../../../../types/interfaces/http.interface";
import { IProduction } from "../../../../types/interfaces/production.interface";

@Injectable({
  providedIn: 'root'
})
export class ProductionService extends BaseService {
  constructor() {
    super();
  }

  list(qParams: ITableQueryData): Observable<IResList<IProduction>> {
    return this.getRequest({ url: Endpoint.PRODUCTION, qParams, spinner: false });
  }

  detail(id: string): Observable<IResDetail<IProduction>> {
    return this.getRequest({ url: Endpoint.PRODUCTION_ID(id), spinner: false });
  }

  create(body: any): Observable<IResDetail<IProduction>> {
    return this.postRequest({ url: Endpoint.PRODUCTION, body });
  }

  update(id: string, body: any): Observable<IResDetail<IProduction>> {
    return this.putRequest({ url: Endpoint.PRODUCTION_ID(id), body });
  }

  start(id: string): Observable<IResDetail<IProduction>> {
    return this.patchRequest({ url: Endpoint.PRODUCTION_ID_START(id), body: {} });
  }

  finish(id: string): Observable<IResDetail<IProduction>> {
    return this.patchRequest({ url: Endpoint.PRODUCTION_ID_FINISH(id), body: {} });
  }

  remove(id: string): Observable<IResDetail<IProduction>> {
    return this.deleteRequest({ url: Endpoint.PRODUCTION_ID(id) });
  }
}
