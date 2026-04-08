import { Component, Input, OnInit } from '@angular/core';
import { RoleService } from '../role-service';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IRoleUpsertDto, TModules } from '../../../../types/interfaces/user.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { ROLE } from '../../../../types/constants/menus';
import { FormValidation } from '../../../../shared/directives/form-validation/form-validation';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { formType } from '../../../../types/interfaces/common.interface';
import { ColumnProps } from '../../../../shared/components/generic-table/generic-table';

@Component({
  selector: 'app-role-form',
  imports: [ReactiveFormsModule, FormValidation],
  templateUrl: './role-form.html',
  styleUrl: './role-form.scss'
})
export class RoleForm implements OnInit {
  isLoading: boolean = false;
  @Input() type: formType = 'new';
  @Input() id?: string;

   columns: Array<ColumnProps> = [
    {
      label: 'Module',
      id: 'module',
      extraHeaderClass: 'uppercase-text',
    },
    {
      label: 'View',
      id: 'view',
      extraHeaderClass: 'uppercase-text',
    },
    {
      label: 'Create',
      id: 'create',
      extraHeaderClass: 'uppercase-text',
    },
    {
      label: 'Edit',
      id: 'edit',
      extraHeaderClass: 'uppercase-text',
    },
    {
      label: 'Delete',
      id: 'delete',
      extraHeaderClass: 'uppercase-text',
    },
  ]


  form: FormGroup = new FormGroup({
    role_name: new FormControl(null, [Validators.required]),
    modules: new FormArray<FormGroup>([]),
    active: new FormControl(false)
  });

  get modules(): FormArray<FormGroup> {
    return this.form.get('modules') as FormArray<FormGroup>;
  }

  constructor(private roleService: RoleService, private route: ActivatedRoute, private router: Router, private alert: AlertService) {
    this.id = this.route.snapshot.paramMap.get('role_id') || undefined;
    const type = this.route.snapshot.queryParamMap.get('type') || undefined;
    if (type && ['new', 'edit', 'view'].includes(type)) {
      this.type = type as formType;
    }
  }

  private buildModuleGroup(module: string): FormGroup {
    return new FormGroup({
      module: new FormControl(module),
      create: new FormControl(false),
      view: new FormControl(false),
      edit: new FormControl(false),
      delete: new FormControl(false),
    });
  }

  getModules() {
    this.isLoading = true;
    this.roleService.getModules().subscribe((res: string[]) => {
      const formArray = this.form.get('modules') as FormArray;
      formArray.clear();

      res.forEach((item) => {
        const [module, action] = item.split('.');
        let moduleGroup = formArray.controls.find(
          (ctrl) => ctrl.get('module')?.value === module
        ) as FormGroup;

        if (!moduleGroup) {
          moduleGroup = this.buildModuleGroup(module);
          formArray.push(moduleGroup);
        }
      });

      this.isLoading = false;
      if (this.id) {
        this.getDetail(this.id);
      }
    });
  }



  getDetail(id: string) {
    this.isLoading = true;
    this.roleService.getRole(id).subscribe((res) => {
      this.form.controls.role_name.patchValue(res.role_name);
      this.form.controls.active.patchValue(res.active);
      const formArray = this.form.get('modules') as FormArray;
      res.modules.forEach((item) => {
        const [module, action] = item.split('.');
        let moduleGroup = formArray.controls.find(
          (ctrl) => ctrl.get('module')?.value === module
        ) as FormGroup;
        if (action) {
          moduleGroup.get(action)?.setValue(true);
        }
      });
      this.isLoading = false;
    });
  }

  ngOnInit(): void {
    this.getModules();
  }

  onCheckChange(evt: any, permision: string, index: number) {
    const val = evt.target.checked;
    console.log('evt', { permision, val });
    this.modules.at(index).controls[permision].patchValue(val);
  }

  submit() {
    if (this.form.invalid) return this.alert.error('Please check your inputs');
    const results: TModules[] = []
    this.modules.value.forEach(item => {
      const { module, ...rest } = item;
      const values = Object.keys(rest)
        .map((tem) => (item[tem] ? `${module}.${tem}` : undefined))
        .filter((value): value is TModules => Boolean(value));
      results.push(...values);
    })

    const body: IRoleUpsertDto = {
      role_name: this.form.value.role_name as string,
      modules: results,
      active: this.form.value.active
    };
    console.log({ body })
    let serviceArg = this.roleService.createRole(body);
    if (this.id) serviceArg = this.roleService.editRole(this.id, body)
    serviceArg.subscribe({
      next: () => {
        this.alert.success(`Success ${this.type == 'edit' ? 'edit' : 'create'} role!`)
        this.router.navigateByUrl(ROLE.url)
      }
    })
  }
}
