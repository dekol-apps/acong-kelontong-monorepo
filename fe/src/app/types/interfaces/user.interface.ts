export enum TModules {
  INVESTMENT_VIEW = 'investment.view',
  INVESTMENT_CREATE = 'investment.create',
  INVESTMENT_EDIT = 'investment.edit',
  INVESTMENT_DELETE = 'investment.delete',
  APPROVAL_PURCHASING_VIEW = 'approval_purchasing.view',
  APPROVAL_PURCHASING_CREATE = 'approval_purchasing.create',
  APPROVAL_PURCHASING_EDIT = 'approval_purchasing.edit',
  APPROVAL_PURCHASING_DELETE = 'approval_purchasing.delete',
  APPROVAL_EXPENSE_VIEW = 'approval_expense.view',
  APPROVAL_EXPENSE_CREATE = 'approval_expense.create',
  APPROVAL_EXPENSE_EDIT = 'approval_expense.edit',
  APPROVAL_EXPENSE_DELETE = 'approval_expense.delete',
  PURCHASING_RECEIVE_VIEW = 'purchasing_receive.view',
  PURCHASING_RECEIVE_CREATE = 'purchasing_receive.create',
  PURCHASING_RECEIVE_EDIT = 'purchasing_receive.edit',
  PURCHASING_RECEIVE_DELETE = 'purchasing_receive.delete',
  INVENTORY_VIEW = 'inventory.view',
  INVENTORY_CREATE = 'inventory.create',
  INVENTORY_EDIT = 'inventory.edit',
  INVENTORY_DELETE = 'inventory.delete',
  PURCHASING_VIEW = 'purchasing.view',
  PURCHASING_CREATE = 'purchasing.create',
  PURCHASING_EDIT = 'purchasing.edit',
  PURCHASING_DELETE = 'purchasing.delete',
  PRODUCT_VIEW = 'product.view',
  PRODUCT_CREATE = 'product.create',
  PRODUCT_EDIT = 'product.edit',
  PRODUCT_DELETE = 'product.delete',
  BRAND_VIEW = 'brand.view',
  BRAND_CREATE = 'brand.create',
  BRAND_EDIT = 'brand.edit',
  BRAND_DELETE = 'brand.delete',
  SUPPLIER_VIEW = 'supplier.view',
  SUPPLIER_CREATE = 'supplier.create',
  SUPPLIER_EDIT = 'supplier.edit',
  SUPPLIER_DELETE = 'supplier.delete',
  CASHFLOW_VIEW = 'cashflow.view',
  CASHFLOW_CREATE = 'cashflow.create',
  CASHFLOW_EDIT = 'cashflow.edit',
  CASHFLOW_DELETE = 'cashflow.delete',
  EXPENSES_VIEW = 'expenses.view',
  EXPENSES_CREATE = 'expenses.create',
  EXPENSES_EDIT = 'expenses.edit',
  EXPENSES_DELETE = 'expenses.delete',
  USER_VIEW = 'user.view',
  USER_CREATE = 'user.create',
  USER_EDIT = 'user.edit',
  USER_DELETE = 'user.delete',
  ROLE_VIEW = 'role.view',
  ROLE_CREATE = 'role.create',
  ROLE_EDIT = 'role.edit',
  ROLE_DELETE = 'role.delete',
  PRODUCTION_VIEW = 'production.view',
  PRODUCTION_CREATE = 'production.create',
  PRODUCTION_EDIT = 'production.edit',
  PRODUCTION_DELETE = 'production.delete',
  SALE_CASHIER_VIEW = 'sale_cashier.view',
  SALE_CASHIER_CREATE = 'sale_cashier.create',
  SALE_CASHIER_EDIT = 'sale_cashier.edit',
  SALE_CASHIER_DELETE = 'sale_cashier.delete',
  SALE_STOCK_VIEW = 'sale_stock.view',
  SALE_STOCK_CREATE = 'sale_stock.create',
  SALE_STOCK_EDIT = 'sale_stock.edit',
  SALE_STOCK_DELETE = 'sale_stock.delete',
  FINANCE_REPORT_VIEW = 'finance_report.view',
  FINANCE_REPORT_CREATE = 'finance_report.create',
  FINANCE_REPORT_EDIT = 'finance_report.edit',
  FINANCE_REPORT_DELETE = 'finance_report.delete'
}

export interface IRole {
    _id?: string,
    role_name: string,
    active: boolean,
    modules: TModules[]
}

export type IRoleUpsertDto = Pick<IRole, 'role_name' | 'active' | 'modules'>;

export interface IUser {
    _id?: string;
    username: string;
    first_name: string;
    last_name: string;
    user_photo?: string;
    email?: string;
    verified?: boolean;
    role: IRole;
}