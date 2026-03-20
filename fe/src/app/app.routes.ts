import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { BRANDS, CASHIER, EXPENSES, CASHFLOW, PRODUCT, SUPPLIERS, USER, ROLE, DASHBOARD, ROLE_DETAIL, ROLE_CREATE, ROLE_EDIT, PURCHASE_ORDER, RECEIVE_ORDER, CAPITAL, SALES_HISTORY, INVENTORY, SHOWCASE, PURCHASE_ORDER_NEW, PURCHASE_ORDER_EDIT, APPROVAL, INVESTMENT, SUPPLIES_PRODUCTION, PURCHASE_ORDER_DETAIL, PURCHASE_ORDER_RECEIVE, INVENTORY_PRODUCT, INVENTORY_ITEM } from './types/constants/menus';
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
      // TODO: remove this dummy later
      {
        path: DASHBOARD.url,
        data: { ...DASHBOARD },
        loadComponent: () => import('./pages/dashboard-v2/dashboard-v2').then(c => c.DashboardV2)
      },
      {
        path: CASHIER.url,
        data: { ...CASHIER },
        canActivate: [PageGuardService],
        loadComponent: () => import('./pages/dashboard-v2/dashboard-v2').then(c => c.DashboardV2)
      },
      {
        path: SALES_HISTORY.url,
        data: { ...SALES_HISTORY },
        canActivate: [PageGuardService],
        loadComponent: () => import('./pages/dashboard-v3/dashboard-v3').then(c => c.DashboardV3)
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
        path: SHOWCASE.url,
        canActivate: [PageGuardService],
        data: { ...SHOWCASE },
        loadComponent: () => import('./pages/catalogue/product/product').then(c => c.Product)
      },
      {
        path: SUPPLIES_PRODUCTION.url,
        canActivate: [PageGuardService],
        data: { ...SUPPLIES_PRODUCTION },
        loadComponent: () => import('./pages/catalogue/product/product').then(c => c.Product)
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
            loadComponent: () => import('./pages/procurement/purchase-order/purchase-order-detail/purchase-order-detail').then(c => c.PurchaseOrderDetail)
          },
          {
            path: PURCHASE_ORDER_RECEIVE.url,
            canActivate: [PageGuardService],
            data: { ...PURCHASE_ORDER_RECEIVE },
            loadComponent: () => import('./pages/procurement/purchase-order/purchase-order-receive-form/purchase-order-receive-form').then(c => c.PurchaseOrderReceiveForm)
          },
        ]
      },
      {
        path: RECEIVE_ORDER.url,
        canActivate: [PageGuardService],
        data: { ...RECEIVE_ORDER },
        loadComponent: () => import('./pages/procurement/receive-order/receive-order').then(c => c.ReceiveOrder)
      },
      {
        path: CASHFLOW.url,
        canActivate: [PageGuardService],
        data: { ...CASHFLOW },
        loadComponent: () => import('./pages/forms/general-elements/general-elements').then(c => c.GeneralElements)
      },
      {
        path: EXPENSES.url,
        canActivate: [PageGuardService],
        data: { ...EXPENSES },
        loadComponent: () => import('./pages/forms/general-elements/general-elements').then(c => c.GeneralElements)
      },
      {
        path: CAPITAL.url,
        canActivate: [PageGuardService],
        data: { ...CAPITAL },
        loadComponent: () => import('./pages/forms/general-elements/general-elements').then(c => c.GeneralElements)
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
  { path: 'error/404', loadComponent: () => import('./layout/error-layout/page-not-found/page-not-found').then(c => c.PageNotFound) },
  // { path: '**', redirectTo: 'error/404' },
];
