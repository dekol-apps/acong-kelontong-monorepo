import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Alert } from '../../../shared/components/alert/alert';
import { PageSpinner } from '../../../shared/components/page-spinner/page-spinner';
import { AuthService } from '../../../services/auth/auth-service';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageToggle } from '../../../shared/components/language-toggle/language-toggle';

@Component({
  selector: 'app-login',
  imports: [RouterLink, Alert, PageSpinner, ReactiveFormsModule, TranslateModule, LanguageToggle],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  @Output() loginUser!: EventEmitter<{ username: string; password: string }>;
  loginForm: FormGroup = new FormGroup({
    username: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required])
  });
  constructor(private authServices: AuthService, private router: Router, private alert: AlertService) {
    this.loginUser = new EventEmitter<{ username: string; password: string }>();
  }
  ngOnInit() {
    this.loginForm.setValue({ username: 'superadmin', password: 'superadmin' });
  }
  onSubmit() {
    this.authServices.login(this.loginForm.value);

  }
}

