import { Injectable } from '@angular/core';
import { BaseService } from '../../../services/rest-api/base-service';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { catchError, map, Observable, of } from 'rxjs';
import { IRole, IUser } from '../../../types/interfaces/user.interface';
import { Endpoint } from '../../../types/constants/endpoint';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { IResDetail, IResList } from '../../../types/interfaces/http.interface';
import { ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { RoleService } from '../role/role-service';

interface IParamsUser extends ITableQueryData {
  verified?: boolean;
}

interface IBodyInviteUser {
  first_name: string;
  last_name: string;
  email: string;
  role: string; // role._id
}

interface IGetRoles extends ITableQueryData {
  active?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {
  constructor(private alert: AlertService, private roleService: RoleService) {
    super();
  }

  getUsers(
    qParams: IParamsUser
  ): Observable<IResList<IUser>> {
    return this.getRequest({ url: Endpoint.USER, qParams, spinner: false }).pipe(
      map((res: IResList<IUser>) => {
        const val = {
          meta: res?.meta as IPaginationInput,
          list: res?.list?.map((item) => {
            return {
              ...item,
              name: `${item.first_name} ${item.last_name}`,
            };
          }) as IUser[],
        };
        return val;
      })
    );
  }

  inviteUser(
    body: IBodyInviteUser
  ): Observable<IUser> {
    return this.postRequest({ url: Endpoint.USER, body }).pipe(
      map((res: IResDetail<IUser>) => {
        return res.detail;
      })
    );
  }

  resendInvitationEmail(user_id: string): Observable<IUser> {
    return this.postRequest({ url: Endpoint.USER_ID_REINVITE(user_id) }).pipe(
      map((res: IResDetail<IUser>) => {
        return res.detail;
      })
    );
  }

  editUserRole(
    user_id: string,
    body: { role: string }
  ): Observable<IUser> {
    return this.putRequest({ url: Endpoint.USER_ID_ROLE(user_id), body }).pipe(
      map((res: IResDetail<IUser>) => {
        return res.detail;
      })
    );
  }

  getUserDetail(user_id: string): Observable<IUser> {
    return this.getRequest({ url: Endpoint.USER_ID(user_id) }).pipe(
      map((res: IResDetail<IUser>) => {
        return res.detail;
      })
    );
  }

  getMyProfile(): Observable<IUser> {
    return this.getRequest({ url: Endpoint.USER_PROFILE }).pipe(
      map((res: IResDetail<IUser>) => res.detail)
    );
  }

  updateMyProfile(body: Pick<IUser, 'first_name' | 'last_name'>): Observable<IUser> {
    return this.putRequest({ url: Endpoint.USER_PROFILE, body }).pipe(
      map((res: IResDetail<IUser>) => res.detail)
    );
  }

  changeMyPassword(body: { old_password: string; new_password: string }): Observable<IUser> {
    return this.putRequest({ url: Endpoint.USER_PROFILE_CHANGE_PASSWORD, body }).pipe(
      map((res: IResDetail<IUser>) => res.detail)
    );
  }

  deleteUser(user_id: string): Observable<IUser> {
    return this.deleteRequest({ url: Endpoint.USER_ID(user_id) }).pipe(
      map((res: IResDetail<IUser>) => {
        return res.detail;
      })
    );
  }

  verifyUser(body: { ticket: string, new_password }): Observable<IUser> {
    return this.putRequest({ url: Endpoint.USER_VERIFY, body });
  }

  getRoles(qParams: IGetRoles): Observable<IResList<IRole>> {
    return this.roleService.getRoles(qParams);
  }
}
