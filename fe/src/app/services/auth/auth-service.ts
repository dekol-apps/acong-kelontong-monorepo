import { Injectable } from '@angular/core';
import { BaseService } from '../rest-api/base-service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Endpoint } from '../../types/constants/endpoint';
import { IUser } from '../../types/interfaces/user.interface';
import { Router } from '@angular/router';
import { AlertService } from '../../shared/components/alert/alert-service';
import { IAuth, TLogoutOption } from '../../types/interfaces/common.interface';
import { StorageService } from '../tools/storage-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService {
  private profileSubject: BehaviorSubject<IUser | undefined>;
  public profile$: Observable<IUser | undefined>;

  constructor(
    private router: Router,
    private alert: AlertService,
    private storage: StorageService,
  ) {
    super();
    this.profileSubject = new BehaviorSubject<IUser | undefined>(this.storage.getItem('profile'));
    this.profile$ = this.profileSubject.asObservable();
  }

  /** ✅ Auth check works in SSR and browser */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  setAccessToken(token: string) {
    return this.storage.setItem('access_token', token);
  }

  getAccessToken(): string | undefined {
    return this.storage.getItem('access_token');
  }

  clearAccessToken() {
    this.storage.removeItem('access_token');
  }

  setProfile(profile: IUser) {
    this.storage.setItem('profile', profile);
    this.profileSubject.next(profile);
  }

  getProfile(): IUser | undefined {
    return this.storage.getItem('profile');
  }

  login(body: { username: string, password: string }) {
    this.postRequest({ url: Endpoint.LOGIN, body }).pipe(
      tap((res: { detail: IAuth }) => {
        try {
          const token = res.detail.access_token;
          const profile: IUser = res.detail.profile;
          if (token) {
            this.setProfile(profile);
            this.setAccessToken(token);
          }
        } catch (err) {
          console.error({ err })
        }
      })
    ).subscribe(() => {
      // NOTE: this is mandatory, we need to do re laod the DOM, because AdminLTE’s JS imported via src/assets runs only once on initial page load (when the DOM first exists, which is the login page).
      // So after navigating to admin page, the JS will lose its reference to its own custom attribute: data-lte-toggle="treeview, data-lte-pushmenu, etc".
      // One of the symptomp is when after user navigated to admin page, when they click one of any menu triggered by href=#, angular will navigate to # as route target.
      // The actual expectation is the AdminLTE JS should catch that # to trigger toggle function. so if the JS is valid, it should trigger something instead of navigating to #.
      // TODO: if AdminLTE version is 4 already launched on NPM, we better switch to it instead of manual import from src/assets to solve this problem

      // UPDATES: i have import AdminLTE via node_modules and still the same, this bug rely on AdminLTE itself not how the way we use it. (https://github.com/ColorlibHQ/AdminLTE/issues/1570)
      window.location.href = "/"
      this.alert.success("Logged in succesfully!");
    });
  }

  refreshToken(): Observable<{ detail: IAuth }> {
    return this.postRequest({ url: Endpoint.REFRESH }).pipe(
      tap((res: { detail: IAuth }) => {
        const token = res.detail.access_token;
        if (token) {
          this.setAccessToken(token);
        }
      })
    );
  }

  logout(option?: TLogoutOption) {
    this.storage.clear();
    this.profileSubject.next(undefined);
    this.router.navigateByUrl('/login').then(() => {
      this.postRequest({ url: Endpoint.LOGOUT, qParams: { option } }).subscribe();
    });
  }

  isImmediateChangePassword() {
    return false;
  }
}
