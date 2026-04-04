import { Injectable } from '@angular/core';
import { BaseService } from '../rest-api/base-service';
import { Endpoint } from '../../types/constants/endpoint';
import { map, Observable } from 'rxjs';
import { IResDetail } from '../../types/interfaces/http.interface';
import { IPortofolio } from '../../types/interfaces/finance.interface';

@Injectable({
  providedIn: 'root'
})
export class GeneralService extends BaseService {

  getPortofolio(): Observable<IPortofolio | undefined> {
    return this.getRequest({ url: Endpoint.ACCOUNTING }).pipe(
      map((res: IResDetail<IPortofolio>) => {
        return res.detail;
      })
    );
  }
}
