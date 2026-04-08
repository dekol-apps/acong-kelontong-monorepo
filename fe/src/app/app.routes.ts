import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { BRANDS, CASHIER, EXPENSES, EXPENSES_DETAIL, EXPENSES_EDIT, EXPENSES_FORM, CASHFLOW, CASHFLOW_DETAIL, FINANCE_REPORT, PRODUCT, SUPPLIERS, USER, ROLE, DASHBOARD, ROLE_DETAIL, ROLE_CREATE, ROLE_EDIT, PURCHASE_ORDER, RECEIVE_ORDER, SALES_HISTORY, INVENTORY, PURCHASE_ORDER_NEW, PURCHASE_ORDER_EDIT, APPROVAL, INVESTMENT, PURCHASE_ORDER_DETAIL, PURCHASE_ORDER_RECEIVE, INVENTORY_PRODUCT, INVENTORY_ITEM, INVENTORY_MOVEMENT, INVENTORY_MOVEMENT_DETAIL, INVENTORY_MOVEMENT_ITEM, INVENTORY_MOVEMENT_MANUAL, SALE_STOCK, SALE_STOCK_PRODUCT, SALE_STOCK_ITEM, SALE_STOCK_FORM, SALES_HISTORY_DETAIL, PRODUCTION, PRODUCTION_FORM, PRODUCTION_DETAIL, RECEIVE_ORDER_DETAIL, PROFILE } from './types/constants/menus';
import { AuthGuardService } from './services/guards/auth-guard/auth-guard-service';
import { PageGuardService } from './services/guards/page-guard/page-guard-service';

export const routes: Routes = [
  {
    path: '',
    redirectTo: DASHBOARD.url,
    pathMatch: 'full'
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [AuthGuardService],
    children: [
      { path: PROFILE.url, loadComponent: () => import('./pages/profile/profile').then(c => c.Profile) },
      {
        path: DASHBOARD.url,
        data: { ...DASHBOARD },
        loadComponent: () => import('./pages/dashboard/dashboard').then(c => c.Dashboard)
      },
      {
        path: SALE_STOCK.url,
        canActivate: [PageGuardService],
        data: { ...SALE_STOCK },
        loadComponent: () => import('./pages/sales/sale-stock/sale-stock').then(c => c.SaleStock)
      },
      {
        path: SALE_STOCK_FORM.url,
        canActivate: [PageGuardService],
        data: { ...SALE_STOCK_FORM },
        loadComponent: () => import('./pages/sales/sale-stock-movement-form/sale-stock-movement-form').then(c => c.SaleStockMovementForm)
      },
      {
        path: SALE_STOCK_PRODUCT.url,
        canActivate: [PageGuardService],
        data: { ...SALE_STOCK_PRODUCT },
        loadComponent: () => import('./pages/sales/sale-stock-item/sale-stock-item').then(c => c.SaleStockItem)
      },
      {
        path: SALE_STOCK_ITEM.url,
        canActivate: [PageGuardService],
        data: { ...SALE_STOCK_ITEM },
        loadComponent: () => import('./pages/sales/sale-stock-item-detail/sale-stock-item-detail').then(c => c.SaleStockItemDetail)
      },
      {
        path: CASHIER.url,
        data: { ...CASHIER },
        canActivate: [PageGuardService],
        loadComponent: () => import('./pages/sales/cashier/cashier').then(c => c.Cashier)
      },
      {
        path: SALES_HISTORY.url,
        data: { ...SALES_HISTORY },
        canActivate: [PageGuardService],
        loadComponent: () => import('./pages/sales/sales-history/sales-history').then(c => c.SalesHistory)
      },
      {
        path: SALES_HISTORY_DETAIL.url,
        data: { ...SALES_HISTORY_DETAIL },
        canActivate: [PageGuardService],
        loadComponent: () => import('./pages/sales/sales-history-detail/sales-history-detail').then(c => c.SalesHistoryDetail)
      },
      {
        path: INVESTMENT.url,
        data: { ...INVESTMENT },
        loadComponent: () => import('./pages/investment/investment').then(c => c.Investment)
      },
      {
        path: APPROVAL.url,
        data: { ...APPROVAL },
        loadComponent: () => import('./pages/approval/approval').then(c => c.Approval)
      },
      {
        path: PRODUCT.url,
        canActivate: [PageGuardService],
        data: { ...PRODUCT },
        loadComponent: () => import('./pages/catalogue/product/product').then(c => c.Product)
      },
      {
        path: BRANDS.url,
        canActivate: [PageGuardService],
        data: { ...BRANDS },
        loadComponent: () => import('./pages/catalogue/brand/brand').then(c => c.Brand)
      },
      {
        path: INVENTORY.url,
        canActivate: [PageGuardService],
        data: { ...INVENTORY },
        loadComponent: () => import('./pages/asset/inventory/inventory').then(c => c.Inventory)
      },
      {
        path: INVENTORY_PRODUCT.url,
        canActivate: [PageGuardService],
        data: { ...INVENTORY_PRODUCT },
        loadComponent: () => import('./pages/asset/inventory-item/inventory-item').then(c => c.InventoryItem)
      },
      {
        path: INVENTORY_ITEM.url,
        canActivate: [PageGuardService],
        data: { ...INVENTORY_ITEM },
        loadComponent: () => import('./pages/asset/inventory-item-detail/inventory-item-detail').then(c => c.InventoryItemDetail)
      },
      {
        path: INVENTORY_MOVEMENT.url,
        data: { ...INVENTORY_MOVEMENT },
        children: [
          {
            path: '',
            canActivate: [PageGuardService],
            loadComponent: () => import('./pages/asset/inventory-movement/inventory-movement').then(c => c.InventoryMovement)
          },
          {
            path: 'form',
            canActivate: [PageGuardService],
            data: { ...INVENTORY_MOVEMENT_MANUAL },
            loadComponent: () => import('./pages/asset/inventory-movement-form/inventory-movement-form').then(c => c.InventoryMovementForm)
          }
        ]
      },
      {
        path: INVENTORY_MOVEMENT_DETAIL.url,
        canActivate: [PageGuardService],
        data: { ...INVENTORY_MOVEMENT_DETAIL },
        loadComponent: () => import('./pages/asset/inventory-movement-detail/inventory-movement-detail').then(c => c.InventoryMovementDetail)
      },
      {
        path: INVENTORY_MOVEMENT_ITEM.url,
        canActivate: [PageGuardService],
        data: { ...INVENTORY_MOVEMENT_ITEM },
        loadComponent: () => import('./pages/asset/inventory-movement-item-detail/inventory-movement-item-detail').then(c => c.InventoryMovementItemDetail)
      },
      {
        path: PRODUCTION.url,
        data: { ...PRODUCTION },
        children: [
          {
            path: '',
            canActivate: [PageGuardService],
            loadComponent: () => import('./pages/asset/production/production').then(c => c.Production)
          },
          {
            path: 'form',
            canActivate: [PageGuardService],
            data: { ...PRODUCTION_FORM },
            loadComponent: () => import('./pages/asset/production-form/production-form').then(c => c.ProductionForm)
          },
          {
            path: 'form/:id',
            canActivate: [PageGuardService],
            data: { ...PRODUCTION_FORM },
            loadComponent: () => import('./pages/asset/production-form/production-form').then(c => c.ProductionForm)
          },
          {
            path: 'detail/:id',
            canActivate: [PageGuardService],
            data: { ...PRODUCTION_DETAIL },
            loadComponent: () => import('./pages/asset/production-detail/production-detail').then(c => c.ProductionDetail)
          }
        ]
      },
      {
        path: SUPPLIERS.url,
        canActivate: [PageGuardService],
        data: { ...SUPPLIERS },
        loadComponent: () => import('./pages/procurement/supplier/supplier').then(c => c.Supplier)
      },
      {
        path: PURCHASE_ORDER.url,
        data: { ...PURCHASE_ORDER },
        children: [
          {
            path: '',
            canActivate: [PageGuardService],
            loadComponent: () => import('./pages/procurement/purchase-order/purchase-order').then(c => c.PurchaseOrder)
          },
          {
            path: 'form',
            redirectTo: 'form/1',
            pathMatch: 'full'
          },
          {
            path: PURCHASE_ORDER_NEW.url,
            canActivate: [PageGuardService],
            data: { ...PURCHASE_ORDER_NEW },
            loadComponent: () => import('./pages/procurement/purchase-order/purchase-order-form/purchase-order-form').then(c => c.PurchaseOrderForm)
          },
          {
            path: PURCHASE_ORDER_EDIT.url,
            canActivate: [PageGuardService],
            data: { ...PURCHASE_ORDER_EDIT },
            loadComponent: () => import('./pages/procurement/purchase-order/purchase-order-form/purchase-order-form').then(c => c.PurchaseOrderForm)
          },
          {
            path: PURCHASE_ORDER_DETAIL.url,
            canActivate: [PageGuardService],
            data: { ...PURCHASE_ORDER_DETAIL },
            loadComponent: () => import('./pages/procurement/purchase-order-detail/purchase-order-detail').then(c => c.PurchaseOrderDetail)
          },
        ]
      },
      {
        path: RECEIVE_ORDER.url,
        canActivate: [PageGuardService],
        data: { ...RECEIVE_ORDER },
        children: [
          {
            path: '',
            canActivate: [PageGuardService],
            loadComponent: () => import('./pages/procurement/receive-order/receive-order').then(c => c.ReceiveOrder)
          },
          {
            path: RECEIVE_ORDER_DETAIL.url,
            canActivate: [PageGuardService],
            data: { ...RECEIVE_ORDER_DETAIL },
            loadComponent: () => import('./pages/procurement/purchase-order-detail/purchase-order-detail').then(c => c.PurchaseOrderDetail)
          },
          {
            path: PURCHASE_ORDER_RECEIVE.url,
            canActivate: [PageGuardService],
            data: { ...PURCHASE_ORDER_RECEIVE },
            loadComponent: () => import('./pages/procurement/receive-order/receive-order-form/receive-order-form').then(c => c.ReceiveOrderForm)
          },
        ]
      },
      {
        path: CASHFLOW.url,
        canActivate: [PageGuardService],
        data: { ...CASHFLOW },
        loadComponent: () => import('./pages/finance/cashflow/cashflow').then(c => c.Cashflow)
      },
      {
        path: CASHFLOW_DETAIL.url,
        canActivate: [PageGuardService],
        data: { ...CASHFLOW_DETAIL },
        loadComponent: () => import('./pages/finance/cashflow-detail/cashflow-detail').then(c => c.CashflowDetail)
      },
      {
        path: FINANCE_REPORT.url,
        canActivate: [PageGuardService],
        data: { ...FINANCE_REPORT },
        loadComponent: () => import('./pages/finance/finance-report/finance-report').then(c => c.FinanceReport)
      },
      {
        path: EXPENSES.url,
        data: { ...EXPENSES },
        children: [
          {
            path: '',
            canActivate: [PageGuardService],
            loadComponent: () => import('./pages/finance/expense/expense').then(c => c.Expense)
          },
          {
            path: EXPENSES_FORM.url,
            canActivate: [PageGuardService],
            data: { ...EXPENSES_FORM },
            loadComponent: () => import('./pages/finance/expense/expense-form/expense-form').then(c => c.ExpenseForm)
          },
          {
            path: EXPENSES_EDIT.url,
            canActivate: [PageGuardService],
            data: { ...EXPENSES_EDIT },
            loadComponent: () => import('./pages/finance/expense/expense-form/expense-form').then(c => c.ExpenseForm)
          },
          {
            path: EXPENSES_DETAIL.url,
            canActivate: [PageGuardService],
            data: { ...EXPENSES_DETAIL },
            loadComponent: () => import('./pages/finance/expense/expense-detail/expense-detail').then(c => c.ExpenseDetail)
          },
        ]
      },
      {
        path: ROLE.url,
        data: { ...ROLE },
        children: [
          {
            path: '',
            canActivate: [PageGuardService],
            loadComponent: () => import('./pages/admin/role/role').then(c => c.Role)
          },
          {
            path: ROLE_CREATE.url,
            canActivate: [PageGuardService],
            data: { ...ROLE_CREATE },
            loadComponent: () => import('./pages/admin/role/role-form/role-form').then(c => c.RoleForm)
          },
          {
            path: ROLE_DETAIL.url,
            canActivate: [PageGuardService],
            data: { ...ROLE_DETAIL },
            loadComponent: () => import('./pages/admin/role/role-form/role-form').then(c => c.RoleForm)
          },
          {
            path: ROLE_EDIT.url,
            canActivate: [PageGuardService],
            data: { ...ROLE_EDIT },
            loadComponent: () => import('./pages/admin/role/role-form/role-form').then(c => c.RoleForm)
          },
        ]
      },
      {
        path: USER.url,
        canActivate: [PageGuardService],
        data: { ...USER },
        loadComponent: () => import('./pages/admin/user/user').then(c => c.User),
      }
    ]
  },
  { path: 'login', loadComponent: () => import('./layout/auth-layout/login/login').then(c => c.Login) },
  { path: 'user-verification/:ticket', loadComponent: () => import('./pages/admin/user/user-verification/user-verification').then(c => c.UserVerification) },
  { path: '**', loadComponent: () => import('./layout/error-layout/page-not-found/page-not-found').then(c => c.PageNotFound) },
];
