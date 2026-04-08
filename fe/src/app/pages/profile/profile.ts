import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../shared/components/alert/alert-service';
import { PageSpinner } from '../../shared/components/page-spinner/page-spinner';
import { FormValidation } from '../../shared/directives/form-validation/form-validation';
import { AuthService } from '../../services/auth/auth-service';
import { UserService } from '../admin/user/user-service';
import { IUser } from '../../types/interfaces/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormValidation, PageSpinner],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  isLoading = false;
  isSavingProfile = false;
  isSavingPassword = false;
  isAuthenticated = false;

  profile?: IUser;

  profileForm = new FormGroup({
    first_name: new FormControl('', [Validators.required]),
    last_name: new FormControl('', [Validators.required]),
  });

  passwordForm = new FormGroup({
    old_password: new FormControl('', [Validators.required]),
    new_password: new FormControl('', [Validators.required]),
    confirm_password: new FormControl('', [Validators.required]),
  });

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private alert: AlertService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.auth.isAuthenticated();
    if (this.isAuthenticated) {
      this.loadProfile();
    }
  }

  loadProfile() {
    this.isLoading = true;
    this.userService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          first_name: profile.first_name,
          last_name: profile.last_name,
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.alert.error('Failed to load profile');
      },
    });
  }

  loginRedirect(): void {
    this.router.navigate(['/login']);
  }

  get profileInitials(): string {
    const firstName = this.profile?.first_name?.trim()?.[0] ?? 'U';
    const lastName = this.profile?.last_name?.trim()?.[0] ?? '';
    return `${firstName}${lastName}`.toUpperCase();
  }

  get roleName(): string {
    return this.profile?.role?.role_name ?? 'Role';
  }

  get passwordMismatch(): boolean {
    const value = this.passwordForm.value;
    return !!value.new_password && !!value.confirm_password && value.new_password !== value.confirm_password;
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSavingProfile = true;
    this.userService.updateMyProfile({
      first_name: this.profileForm.value.first_name ?? '',
      last_name: this.profileForm.value.last_name ?? '',
    }).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.auth.setProfile(profile);
        this.isSavingProfile = false;
        this.alert.success('Profile updated');
      },
      error: () => {
        this.isSavingProfile = false;
        this.alert.error('Failed to update profile');
      },
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (this.passwordMismatch) {
      this.alert.error('New password confirmation does not match');
      return;
    }

    this.isSavingPassword = true;
    this.userService.changeMyPassword({
      old_password: this.passwordForm.value.old_password ?? '',
      new_password: this.passwordForm.value.new_password ?? '',
    }).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.passwordForm.reset();
        this.alert.success('Password updated');
      },
      error: () => {
        this.isSavingPassword = false;
        this.alert.error('Failed to change password');
      },
    });
  }
}
