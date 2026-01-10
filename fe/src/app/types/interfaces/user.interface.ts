export type TModules =
    'investment.view' | 'investment.create' | 'investment.edit' | 'investment.delete' |
    'approval.view' | 'approval.create' | 'approval.edit' | 'approval.delete' |
    'inventory.view' | 'inventory.create' | 'inventory.edit' | 'inventory.delete' |
    'showcase.view' | 'showcase.create' | 'showcase.edit' | 'showcase.delete' |
    'purchasing.view' | 'purchasing.create' | 'purchasing.edit' | 'purchasing.delete' |
    'cashier.view' | 'cashier.create' | 'cashier.edit' | 'cashier.delete' |
    'product.view' | 'product.create' | 'product.edit' | 'product.delete' |
    'brand.view' | 'brand.create' | 'brand.edit' | 'brand.delete' |
    'supplier.view' | 'supplier.create' | 'supplier.edit' | 'supplier.delete' |
    'capital.view' | 'capital.create' | 'capital.edit' | 'capital.delete' |
    'cashflow.view' | 'cashflow.create' | 'cashflow.edit' | 'cashflow.delete' |
    'expenses.view' | 'expenses.create' | 'expenses.edit' | 'expenses.delete' |
    'user.view' | 'user.create' | 'user.edit' | 'user.delete' |
    'role.view' | 'role.create' | 'role.edit' | 'role.delete'

    // TODO: remove this dummy later
    | 'dashboard.view' |
    'dashboard.edit' |
    'dashboard.create' |
    'dashboard-v1.view' |
    'dashboard-v1.edit' |
    'dashboard-v1.create' |
    'dashboard-v2.view' |
    'dashboard-v3.view' |
    'tables.view' |
    'tables-simple.view' |
    'forms.view' |
    'forms-general.view';

export interface IRole {
    _id?: string,
    role_name: string,
    active: boolean,
    modules: TModules[]
}

export interface IUser {
    _id?: string;
    first_name: string;
    last_name: string;
    email?: string;
    verified?: boolean;
    role: IRole;
}