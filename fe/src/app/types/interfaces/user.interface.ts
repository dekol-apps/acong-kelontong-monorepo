export type TModules =
    'investment.view' | 'investment.create' | 'investment.edit' | 'investment.delete' |
    'approval_purchasing.view' | 'approval_purchasing.create' |
    'approval_expense.view' | 'approval_expense.create' |
    'purchasing_receive.view' | 'purchasing_receive.create' |
    'inventory.view' | 'inventory.create' | 'inventory.edit' | 'inventory.delete' |
    'purchasing.view' | 'purchasing.create' | 'purchasing.edit' | 'purchasing.delete' |
    'product.view' | 'product.create' | 'product.edit' | 'product.delete' |
    'brand.view' | 'brand.create' | 'brand.edit' | 'brand.delete' |
    'supplier.view' | 'supplier.create' | 'supplier.edit' | 'supplier.delete' |
    'cashflow.view' |
    'expenses.view' | 'expenses.create' | 'expenses.edit' | 'expenses.delete' |
    'user.view' | 'user.create' | 'user.edit' | 'user.delete' |
    'role.view' | 'role.create' | 'role.edit' | 'role.delete' |
    'production.view' | 'production.create' | 'production.edit' | 'production.delete' |
    'sale_cashier.view' | 'sale_cashier.create' | 'sale_cashier.edit' |
    'sale_stock.view' | 'sale_stock.create' |
    'finance_report.view' |
    'dashboard.view'

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