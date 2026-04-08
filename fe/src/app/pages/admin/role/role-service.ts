import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { Endpoint } from '../../../types/constants/endpoint';
import { IRole, IRoleUpsertDto, TModules } from '../../../types/interfaces/user.interface';
import { BaseService } from '../../../services/rest-api/base-service';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { IResDetail, IResList } from '../../../types/interfaces/http.interface';
import { ITableQueryData } from '../../../shared/components/generic-table/generic-table';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseService {
  constructor(private alert: AlertService) {
    super();
  }

  getRoles(
    qParams: ITableQueryData
  ): Observable<IResList<IRole>> {
    return this.getRequest({ url: Endpoint.ROLE, qParams, spinner: false }).pipe(
      map((res: IResList<IRole>) => {
        return res;
      }),
    );
  }

  getRole(id: string): Observable<IRole> {
    return this.getRequest({ url: Endpoint.ROLE_ID(id) }).pipe(
      map((res: IResDetail<IRole>) => {
        return res.detail;
      })
    );
  }

  createRole(
    body: IRoleUpsertDto
  ): Observable<IRole> {
    return this.postRequest({ url: Endpoint.ROLE, body }).pipe(
      map((res: IResDetail<IRole>) => {
        return res.detail;
      })
    );
  }

  editRole(
    id: string,
    body: IRoleUpsertDto
  ): Observable<IRole> {
    return this.putRequest({ url: Endpoint.ROLE_ID(id), body }).pipe(
      map((res: IResDetail<IRole>) => {
        return res.detail;
      })
    );
  }

  deleteRole(
    role_id: string
  ): Observable<void> {
    return this.deleteRequest({ url: Endpoint.ROLE_ID(role_id) }).pipe(
      map((res: IResDetail<unknown>) => {
        this.alert.success('Success delete role');
      })
    );
  }

  getModules(): Observable<TModules[]> {
    return this.getRequest({ url: Endpoint.PERMISSIONS }).pipe(
      map((res: IResDetail<TModules[]>) => {
        return res.detail;
      })
    );
  }
}
