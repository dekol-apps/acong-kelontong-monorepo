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
  'approval.view', 'approval.create', 'approval.edit', 'approval.delete',
  'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete',
  'showcase.view', 'showcase.create', 'showcase.edit', 'showcase.delete',
  'purchasing.view', 'purchasing.create', 'purchasing.edit', 'purchasing.delete',
  'cashier.view', 'cashier.create', 'cashier.edit', 'cashier.delete',
  'product.view', 'product.create', 'product.edit', 'product.delete',
  'brand.view', 'brand.create', 'brand.edit', 'brand.delete',
  'supplier.view', 'supplier.create', 'supplier.edit', 'supplier.delete',
  'capital.view', 'capital.create', 'capital.edit', 'capital.delete',
  'cashflow.view', 'cashflow.create', 'cashflow.edit', 'cashflow.delete',
  'expenses.view', 'expenses.create', 'expenses.edit', 'expenses.delete',
  'user.view', 'user.create', 'user.edit', 'user.delete',
  'role.view', 'role.create', 'role.edit', 'role.delete'
];

