import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { IMenu } from '../../types/interfaces/menu.interface';
import { NavigationService } from '../../services/navigation/navigation-service';
import { IBreadcrumb } from '../../types/interfaces/breadcrumb.interface';
import { Alert } from '../../shared/components/alert/alert';
import { PageSpinner } from '../../shared/components/page-spinner/page-spinner';
import { AuthService } from '../../services/auth/auth-service';
import { IUser, TModules } from '../../types/interfaces/user.interface';
import { Menus } from '../../types/constants/menus';
import { filter } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageToggle } from '../../shared/components/language-toggle/language-toggle';
@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterModule, Alert, PageSpinner, TranslateModule, LanguageToggle],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit {
  menuItems: IMenu[] = [];
  breadcrumbs: IBreadcrumb[] = [];
  pageTitle: string = '';
  modules: TModules[] = [];
  openMenuKeys: Record<string, boolean> = {};

  profile?: IUser = {} as IUser;
  userName: string = '';
  role: string = '';

  constructor(private navSvc: NavigationService, private router: Router, protected activatedRoute: ActivatedRoute, private auth: AuthService) {
    this.breadcrumbs = navSvc.buildBreadCrumb();
    this.navSvc.breadcrumbs.subscribe((val) => {
      this.breadcrumbs = val;
      if (this.breadcrumbs.length > 0) this.breadcrumbs.at(-1)!.disabled = true;
      this.pageTitle = this.breadcrumbs.length > 0 ? this.breadcrumbs.at(-1)?.labelKey || '' : '';
    });
    this.profile = this.auth?.getProfile() ?? {} as IUser;
    this.userName = `${this.profile?.first_name ?? 'User'} ${this.profile?.last_name ?? 'Name'}`;
    this.role = this.profile?.role?.role_name ?? 'Role' as string;
  }

  ngOnInit(): void {
    const modules = this.auth.getProfile()?.role.modules || [];
    // TODO: remove this dummy later
    this.modules = modules.concat('dashboard.view')
    this.updateMenus();

    // Keep parent accordion opened for active child route.
    this.syncOpenedMenusWithRoute(this.router.url);
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      const navigationEvent = event as NavigationEnd;
      this.syncOpenedMenusWithRoute(navigationEvent.urlAfterRedirects);
    });
  }

  updateMenus() {
    const permitted: IMenu[] = [];
    Menus.forEach((menu: IMenu) => {
      if (menu.children && menu.children.length > 0) {
        menu.children = menu.children.filter((child: IMenu) => {
          return this.modules.find(item => child.permissions?.includes(item))
        });
        if (menu.children.length > 0) {
          permitted.push(menu)
        }
      } else if (this.modules?.find(item => menu.permissions?.includes(item))) {
        permitted.push(menu)
      }
    })
    console.log({ menu: this.menuItems, permitted, module: this.modules })
    this.menuItems = permitted;
  }

  logout() {
    this.auth.logout('current');
  }

  getMenuKey(menu: IMenu): string {
    return menu.url || menu.labelKey || '';
  }

  isMenuOpen(menu: IMenu): boolean {
    const key = this.getMenuKey(menu);
    return !!this.openMenuKeys[key];
  }

  toggleMenu(menu: IMenu): void {
    const key = this.getMenuKey(menu);
    this.openMenuKeys[key] = !this.openMenuKeys[key];
  }

  private syncOpenedMenusWithRoute(url: string): void {
    const currentPath = url.split('?')[0].split('#')[0];

    this.menuItems.forEach((menu) => {
      if (!menu.children?.length) {
        return;
      }

      const hasActiveChild = menu.children.some((child) => {
        const childPath = child.url?.startsWith('/') ? child.url : `/${child.url || ''}`;
        return currentPath === childPath || currentPath.startsWith(`${childPath}/`);
      });

      if (hasActiveChild) {
        this.openMenuKeys[this.getMenuKey(menu)] = true;
      }
    });
  }
}
