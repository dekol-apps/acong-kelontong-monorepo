import { Component, Input, OnInit } from '@angular/core';
import { RoleService } from '../role-service';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IRoleUpsertDto, TModules } from '../../../../types/interfaces/user.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { ROLE } from '../../../../types/constants/menus';
import { FormValidation } from '../../../../shared/directives/form-validation/form-validation';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { formType } from '../../../../types/interfaces/common.interface';
import { TranslateModule } from '@ngx-translate/core';

const permissionSections = [
  {
    label: 'Dashboard',
    rows: [
      { label: 'Dashboard', module: 'dashboard', actions: ['view'] as const },
    ],
  },
  {
    label: 'Approval',
    rows: [
      { label: 'Purchasing Approval', module: 'approval_purchasing', actions: ['view', 'create'] as const },
      { label: 'Expense Approval', module: 'approval_expense', actions: ['view', 'create'] as const },
    ],
  },
  {
    label: 'Investment',
    rows: [
      { label: 'Investment', module: 'investment', actions: ['view'] as const },
    ],
  },
  {
    label: 'Sales',
    rows: [
      { label: 'Cashier / Sales History', module: 'sale_cashier', actions: ['view', 'create', 'edit'] as const },
      { label: 'Sale Stock', module: 'sale_stock', actions: ['view', 'create'] as const },
    ],
  },
  {
    label: 'Supplies',
    rows: [
      { label: 'Inventory', module: 'inventory', actions: ['view', 'create', 'edit', 'delete'] as const },
      { label: 'Purchase Order', module: 'purchasing', actions: ['view', 'create', 'edit', 'delete'] as const },
      { label: 'Receive Order', module: 'purchasing_receive', actions: ['view', 'create'] as const },
      { label: 'Production', module: 'production', actions: ['view', 'create', 'edit', 'delete'] as const },
    ],
  },
  {
    label: 'Catalogue',
    rows: [
      { label: 'Product', module: 'product', actions: ['view', 'create', 'edit', 'delete'] as const },
      { label: 'Brand', module: 'brand', actions: ['view', 'create', 'edit', 'delete'] as const },
    ],
  },
  {
    label: 'Finance',
    rows: [
      { label: 'Finance Report', module: 'finance_report', actions: ['view'] as const },
      { label: 'Cashflow', module: 'cashflow', actions: ['view'] as const },
      { label: 'Expenses', module: 'expenses', actions: ['view', 'create', 'edit', 'delete'] as const },
    ],
  },
  {
    label: 'Admin',
    rows: [
      { label: 'Role', module: 'role', actions: ['view', 'create', 'edit', 'delete'] as const },
      { label: 'User', module: 'user', actions: ['view', 'create', 'edit', 'delete'] as const },
    ],
  },
] as const;

type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

interface PermissionRowConfig {
  label: string;
  module: string;
  actions: readonly PermissionAction[];
  formIndex: number;
}

interface PermissionSectionConfig {
  label: string;
  rows: PermissionRowConfig[];
}

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, FormValidation, TranslateModule],
  templateUrl: './role-form.html',
  styleUrl: './role-form.scss'
})
export class RoleForm implements OnInit {
  isLoading = false;
  searchTerm = '';
  selectedOnly = false;
  @Input() type: formType = 'new';
  @Input() id?: string;

  permissionSections: PermissionSectionConfig[] = [];
  permissionRows: PermissionRowConfig[] = [];
  actionColumns: Array<{ id: PermissionAction; label: string }> = [
    { id: 'view', label: 'View' },
    { id: 'create', label: 'Create' },
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete' },
  ];

  form: FormGroup = new FormGroup({
    role_name: new FormControl(null, [Validators.required]),
    modules: new FormArray<FormGroup>([]),
    active: new FormControl(false)
  });

  get modules(): FormArray<FormGroup> {
    return this.form.get('modules') as FormArray<FormGroup>;
  }

  get visibleSections(): PermissionSectionConfig[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.permissionSections
      .map((section) => {
        const rows = section.rows.filter((row) => {
          const matchesSearch = !term
            || row.label.toLowerCase().includes(term)
            || row.module.toLowerCase().includes(term)
            || section.label.toLowerCase().includes(term);
          const matchesSelected = !this.selectedOnly || this.rowHasSelection(row.formIndex);
          return matchesSearch && matchesSelected;
        });
        return { ...section, rows };
      })
      .filter((section) => section.rows.length > 0);
  }

  constructor(private roleService: RoleService, private route: ActivatedRoute, private router: Router, private alert: AlertService) {
    this.id = this.route.snapshot.paramMap.get('role_id') || undefined;
    const type = this.route.snapshot.queryParamMap.get('type') || undefined;
    if (type && ['new', 'edit', 'view'].includes(type)) {
      this.type = type as formType;
    }
  }

  private buildModuleGroup(row: PermissionRowConfig, selectedPermissions: Set<string>): FormGroup {
    return new FormGroup({
      module: new FormControl(row.module),
      view: new FormControl({ value: row.actions.includes('view') && selectedPermissions.has(`${row.module}.view`), disabled: !row.actions.includes('view') }),
      create: new FormControl({ value: row.actions.includes('create') && selectedPermissions.has(`${row.module}.create`), disabled: !row.actions.includes('create') }),
      edit: new FormControl({ value: row.actions.includes('edit') && selectedPermissions.has(`${row.module}.edit`), disabled: !row.actions.includes('edit') }),
      delete: new FormControl({ value: row.actions.includes('delete') && selectedPermissions.has(`${row.module}.delete`), disabled: !row.actions.includes('delete') }),
    });
  }

  private buildPermissionMatrix(permissions: string[]) {
    const allowedPermissions = new Set(permissions);
    const sections: PermissionSectionConfig[] = [];
    const rows: PermissionRowConfig[] = [];
    const formArray = this.modules;
    formArray.clear();

    permissionSections.forEach((section) => {
      const sectionRows: PermissionRowConfig[] = [];
      section.rows.forEach((row) => {
        const supportedActions = row.actions.filter((action) => allowedPermissions.has(`${row.module}.${action}`));
        if (supportedActions.length === 0) {
          return;
        }

        const nextRow: PermissionRowConfig = {
          label: row.label,
          module: row.module,
          actions: supportedActions,
          formIndex: rows.length,
        };

        rows.push(nextRow);
        sectionRows.push(nextRow);
        formArray.push(this.buildModuleGroup(nextRow, new Set()));
      });

      if (sectionRows.length > 0) {
        sections.push({
          label: section.label,
          rows: sectionRows,
        });
      }
    });

    this.permissionSections = sections;
    this.permissionRows = rows;
  }

  getModules() {
    this.isLoading = true;
    this.roleService.getModules().subscribe({
      next: (res: string[]) => {
        this.buildPermissionMatrix(res);
        if (this.id) {
          this.getDetail(this.id);
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
        this.alert.error('Failed to load permissions');
      },
    });
  }

  getDetail(id: string) {
    this.isLoading = true;
    this.roleService.getRole(id).subscribe({
      next: (res) => {
        this.form.controls.role_name.patchValue(res.role_name);
        this.form.controls.active.patchValue(res.active);
        const formArray = this.modules;
        res.modules.forEach((item) => {
          const [module, action] = item.split('.');
          const row = this.permissionRows.find((permissionRow) => permissionRow.module === module);
          if (!row || !action) {
            return;
          }
          const group = formArray.at(row.formIndex) as FormGroup | undefined;
          if (group?.get(action)) {
            group.get(action)?.setValue(true);
          }
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.alert.error('Failed to load role detail');
      },
    });
  }

  ngOnInit(): void {
    this.getModules();
  }

  rowHasSelection(index: number) {
    const group = this.modules.at(index) as FormGroup | undefined;
    if (!group) {
      return false;
    }
    return this.actionColumns.some((column) => Boolean(group.get(column.id)?.value));
  }

  sectionSelectedCount(section: PermissionSectionConfig) {
    return section.rows.reduce((total, row) => total + (this.rowHasSelection(row.formIndex) ? 1 : 0), 0);
  }

  submit() {
    if (this.form.invalid) return this.alert.error('Please check your inputs');
    const results: TModules[] = [];

    this.permissionRows.forEach((row) => {
      const group = this.modules.at(row.formIndex) as FormGroup | undefined;
      if (!group) {
        return;
      }
      row.actions.forEach((action) => {
        if (group.get(action)?.value) {
          results.push(`${row.module}.${action}` as TModules);
        }
      });
    });

    const body: IRoleUpsertDto = {
      role_name: this.form.value.role_name as string,
      modules: results,
      active: this.form.value.active
    };
    const serviceArg = this.id ? this.roleService.editRole(this.id, body) : this.roleService.createRole(body);
    serviceArg.subscribe({
      next: () => {
        this.alert.success(`Success ${this.type == 'edit' ? 'edit' : 'create'} role!`);
        this.exit();
      }
    });
  }

  exit() {
    this.router.navigateByUrl(ROLE.url);
  }
}
