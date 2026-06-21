import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IMenu } from '../../types/interfaces/menu.interface';
import { NavigationService } from '../../services/navigation/navigation-service';
import { IBreadcrumb } from '../../types/interfaces/breadcrumb.interface';
import { Alert } from '../../shared/components/alert/alert';
import { PageSpinner } from '../../shared/components/page-spinner/page-spinner';
import { AuthService } from '../../services/auth/auth-service';
import { IUser, TModules } from '../../types/interfaces/user.interface';
import { Menus } from '../../types/constants/menus';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageToggle } from '../../shared/components/language-toggle/language-toggle';
import { UserService } from '../../pages/admin/user/user-service';
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

  profile?: IUser = {} as IUser;
  profilePhoto: string = 'adminlte/img/user2-160x160.jpg';

  constructor(private navSvc: NavigationService, private router: Router, protected activatedRoute: ActivatedRoute, private auth: AuthService, private userService: UserService) {
    this.breadcrumbs = navSvc.buildBreadCrumb();
    this.navSvc.breadcrumbs.subscribe((val) => {
      this.breadcrumbs = val;
      if (this.breadcrumbs.length > 0) this.breadcrumbs.at(-1)!.disabled = true;
      this.pageTitle = this.breadcrumbs.length > 0 ? this.breadcrumbs.at(-1)?.labelKey || '' : '';
    });
    this.profile = this.auth?.getProfile() ?? {} as IUser;
    this.updateProfilePhoto();
    
    // Subscribe to profile changes from auth service
    this.auth.profile$.subscribe((profile) => {
      this.profile = profile ?? {} as IUser;
      this.updateProfilePhoto();
    });
  }

  private updateProfilePhoto() {
    this.profilePhoto = this.profile?.user_photo ?? 'adminlte/img/user2-160x160.jpg';
  }

  get userName(): string {
    const profile = this.auth.getProfile() ?? this.profile;
    return `${profile?.first_name ?? 'User'} ${profile?.last_name ?? 'Name'}`;
  }

  get role(): string {
    const profile = this.auth.getProfile() ?? this.profile;
    return profile?.role?.role_name ?? 'Role';
  }

  ngOnInit(): void {
    this.modules = this.auth.getProfile()?.role.modules || [];
    this.updateMenus();
    
    // Fetch profile from API to get latest user_photo
    this.userService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.updateProfilePhoto();
        this.auth.setProfile(profile); // Update auth service profile too
      },
      error: (err) => {
        console.error('Failed to fetch profile:', err);
      }
    });
  }

  updateMenus() {
    const permitted: IMenu[] = [];
    Menus.forEach((menu: IMenu) => {
      if (menu.children && menu.children.length > 0) {
        menu.children = menu.children.filter((child: IMenu) => {
          return !menu.permissions?.length || this.modules.find(item => child.permissions?.includes(item))
        });
        if (menu.children.length > 0) {
          permitted.push(menu)
        }
      } else if (!menu.permissions?.length || this.modules?.find(item => menu.permissions?.includes(item))) {
        permitted.push(menu)
      }
    })
    console.log({ menu: this.menuItems, permitted, module: this.modules })
    this.menuItems = permitted;
  }

  logout() {
    this.auth.logout('current');
  }

  thisYear = new Date().getFullYear();
}
