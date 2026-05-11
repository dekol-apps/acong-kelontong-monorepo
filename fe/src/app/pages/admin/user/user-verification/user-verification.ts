import { Component } from '@angular/core';
import { Alert } from '../../../../shared/components/alert/alert';
import { PageSpinner } from '../../../../shared/components/page-spinner/page-spinner';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../user/user-service';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { InputValidation } from '../../../../shared/directives/input-validation/input-validation';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-verification',
  imports: [Alert, PageSpinner, ReactiveFormsModule, InputValidation, TranslateModule],
  templateUrl: './user-verification.html',
  styleUrl: './user-verification.scss'
})
export class UserVerification {

  form: FormGroup = new FormGroup({
    new_password: new FormControl(null, [Validators.required]),
    confirm_password: new FormControl(null, [Validators.required]),
  });

  invitationToken: string | null = null;

  constructor(private service: UserService, private route: ActivatedRoute, private alert: AlertService, private translate: TranslateService) {
    const ticket = this.route.snapshot.paramMap.get('ticket') || undefined;
    if (ticket) {
      this.invitationToken = ticket;
    } else {
      this.alert.error(this.translate.instant('Invalid verification link'));
    }
  }

  passwordMatch() {
    const val = this.form.value;
    return val.new_password == val.confirm_password;
  }

  submit() {
    console.log('this.form.invalid', this.form.invalid);
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
      return
    }
    if (this.passwordMismatch()) {
      this.alert.error(this.translate.instant('Passwords do not match'));
      return;
    }
    const { new_password } = this.form.value;
    this.service.changePasswordViaEmail({ token: this.invitationToken as string, new_password }).subscribe({
      next: (res) => {
        this.alert.success(this.translate.instant('Password updated successfully'));
        setTimeout(() => {
          window.location.href = "/login"
        }, 1000)
      },
      error: (err) => {
        this.alert.error(this.translate.instant('Failed to update password'))
      }
    })
  }

  passwordMismatch(): boolean {
    const val = this.form.value;
    return !!val.new_password && !!val.confirm_password && val.new_password !== val.confirm_password;
  }
}
