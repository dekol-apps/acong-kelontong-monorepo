import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../user/user-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IRole } from '../../../../types/interfaces/user.interface';
import { FormValidation } from '../../../../shared/directives/form-validation/form-validation';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { TranslateModule } from '@ngx-translate/core';

type formType = 'new' | 'edit' | 'view';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, FormValidation, TranslateModule],
  standalone: true,
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
})
export class UserForm implements OnInit, AfterViewInit {
  @Input() type: formType = 'new';
  @Input() id?: string;
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>()

  isLoading: boolean = false;

  roles: IRole[] = [];

  form: FormGroup = new FormGroup({
    first_name: new FormControl(null, [Validators.required]),
    last_name: new FormControl(null, [Validators.required]),
    username: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null),
    role: new FormControl(null, [Validators.required]),
  });

  constructor(private userService: UserService, private alert: AlertService) { }

  ngOnInit(): void {
    this.getRoles();
  }

  ngAfterViewInit(): void {
    if (this.id) {
      this.userService.getUserDetail(this.id).subscribe((res) => {
        const { email, first_name, last_name, username } = res
        const role_id = res.role._id
        this.form.patchValue({
          username,
          email,
          first_name,
          last_name,
          role: role_id
        });
        console.log('this.form.value', this.form.value)
      })
    }
  }

  getRoles() {
    this.isLoading = true;
    this.userService.getRoles({ page: 0, size: 1000 }).subscribe((res) => {
      this.roles = res.list ?? [];
    })
  }

  submit() {
    if (this.form.invalid) return this.alert.error('Please check your inputs');
    const body = {
      username: this.form.value.username ?? '',
      email: this.form.value.email ?? '',
      first_name: this.form.value.first_name ?? '',
      last_name: this.form.value.last_name ?? '',
      role: this.form.value.role ?? '',
      ...(this.form.value.password ? { password: this.form.value.password } : {}),
    };
    let serviceArgs = this.userService.inviteUser(body);
    if (this.type === 'edit' && this.id) serviceArgs = this.userService.editUser(this.id, body);
    serviceArgs.subscribe((res) => {
      this.alert.success(`Success ${this.type == 'edit' ? 'edit' : 'invite'} user!`);
      this.close.emit(true);
    })
  }
}
