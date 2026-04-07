import { TModules } from './interfaces';

export const cleanupDays = 30;
export const sessionDays = 7;
export const sessionMinutes = 15;
export const salts = 10
export const errCodes = {
  authGuard: 'GUARD_401'
}

export const modules: TModules[] = [
  'investment.view', 'investment.create', 'investment.edit', 'investment.delete',
  'approval_purchasing.view', 'approval_purchasing.create',
  'approval_expense.view', 'approval_expense.create',
  'purchasing_receive.view', 'purchasing_receive.create',
  'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete',
  'purchasing.view', 'purchasing.create', 'purchasing.edit', 'purchasing.delete',
  'product.view', 'product.create', 'product.edit', 'product.delete',
  'brand.view', 'brand.create', 'brand.edit', 'brand.delete',
  'supplier.view', 'supplier.create', 'supplier.edit', 'supplier.delete',
  'cashflow.view',
  'expenses.view', 'expenses.create', 'expenses.edit', 'expenses.delete',
  'user.view', 'user.create', 'user.edit', 'user.delete',
  'role.view', 'role.create', 'role.edit', 'role.delete',
  'production.view', 'production.create', 'production.edit', 'production.delete',
  'sale_cashier.view', 'sale_cashier.create', 'sale_cashier.edit',
  'sale_stock.view', 'sale_stock.create',
  'finance_report.view'
];

export const defaultPpnRate = 11;
