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
  'approval_purchasing.view', 'approval_purchasing.create', 'approval_purchasing.edit', 'approval_purchasing.delete',
  'approval_expense.view', 'approval_expense.create', 'approval_expense.edit', 'approval_expense.delete',
  'purchasing_receive.view', 'purchasing_receive.create', 'purchasing_receive.edit', 'purchasing_receive.delete',
  'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete',
  'purchasing.view', 'purchasing.create', 'purchasing.edit', 'purchasing.delete',
  'product.view', 'product.create', 'product.edit', 'product.delete',
  'brand.view', 'brand.create', 'brand.edit', 'brand.delete',
  'supplier.view', 'supplier.create', 'supplier.edit', 'supplier.delete',
  'cashflow.view', 'cashflow.create', 'cashflow.edit', 'cashflow.delete',
  'expenses.view', 'expenses.create', 'expenses.edit', 'expenses.delete',
  'user.view', 'user.create', 'user.edit', 'user.delete',
  'role.view', 'role.create', 'role.edit', 'role.delete',
  'production.view', 'production.create', 'production.edit', 'production.delete',
  'sale_cashier.view', 'sale_cashier.create', 'sale_cashier.edit', 'sale_cashier.delete',
  'sale_stock.view', 'sale_stock.create', 'sale_stock.edit', 'sale_stock.delete',
  'finance_report.view', 'finance_report.create', 'finance_report.edit', 'finance_report.delete'
];

export const defaultPpnRate = 11;
