import { IMenu } from "../interfaces/menu.interface";
import { TModules } from '../interfaces/user.interface';

// IMPORTANT NOTES: 
// UI management of Menu is managed by FE, whether it'd be child or independent, its up to FE.
// Permission from BE only to flag if particular module is eligible tobe shown

export const SALES: IMenu = {
    code: 'sales',
    url: 'sales',
    icon: 'nav-icon bi bi-cart3',
    labelKey: 'Sales',
};
export const CASHIER: IMenu = {
    code: 'cashier',
    url: 'cashier',
    icon: '',
    labelKey: 'Cashier',
    permissions: [TModules.SALE_CASHIER_VIEW, TModules.SALE_CASHIER_CREATE, TModules.SALE_CASHIER_EDIT],
};
export const SALES_HISTORY: IMenu = {
    code: 'sales-history',
    url: 'sales-history',
    icon: '',
    labelKey: 'Sales History',
    permissions: [TModules.SALE_CASHIER_VIEW],
};
export const SALES_HISTORY_DETAIL: IMenu = {
    code: 'sales-history-detail',
    url: 'sales-history/:sale_id',
    icon: '',
    labelKey: 'Sales History Detail',
    permissions: [TModules.SALE_CASHIER_VIEW],
}
export const SALE_STOCK: IMenu = {
    code: 'sale-stock',
    url: 'sale-stock',
    icon: '',
    labelKey: 'Sale Stock',
    permissions: [TModules.SALE_STOCK_VIEW],
}
export const SALE_STOCK_PRODUCT: IMenu = {
    code: 'sale-stock-product',
    url: 'sale-stock/data/:product_id',
    icon: '',
    labelKey: 'Sale Stock Product',
    permissions: [TModules.SALE_STOCK_VIEW],
}
export const SALE_STOCK_ITEM: IMenu = {
    code: 'sale-stock-item',
    url: 'sale-stock/data/:product_id/:sale_item_id',
    icon: '',
    labelKey: 'Sale Stock Item',
    permissions: [TModules.SALE_STOCK_VIEW],
}
export const SALE_STOCK_FORM: IMenu = {
    code: 'form',
    url: 'sale-stock/form',
    icon: '',
    labelKey: 'Sale Stock Form',
    permissions: [TModules.SALE_STOCK_CREATE],
}

export const SUPPLIES: IMenu = {
    code: 'supplies',
    url: 'supplies',
    icon: 'nav-icon bi bi-box-seam',
    labelKey: 'Supplies',
};
export const INVENTORY: IMenu = {
    code: 'inventory',
    url: 'inventory',
    icon: '',
    labelKey: 'Inventory',
    permissions: [TModules.INVENTORY_VIEW, TModules.INVENTORY_CREATE, TModules.INVENTORY_EDIT, TModules.INVENTORY_DELETE],
}
export const INVENTORY_PRODUCT: IMenu = {
    code: 'inventory-product',
    url: 'inventory/:product_id',
    icon: '',
    labelKey: 'Inventory Product',
    permissions: [TModules.INVENTORY_VIEW, TModules.INVENTORY_CREATE, TModules.INVENTORY_EDIT, TModules.INVENTORY_DELETE],
}
export const INVENTORY_ITEM: IMenu = {
    code: 'inventory-item',
    url: 'inventory/:product_id/:inventory_item_id',
    icon: '',
    labelKey: 'Inventory Item',
    permissions: [TModules.INVENTORY_VIEW, TModules.INVENTORY_CREATE, TModules.INVENTORY_EDIT, TModules.INVENTORY_DELETE],
}
export const INVENTORY_MOVEMENT: IMenu = {
    code: 'inventory-movement',
    url: 'inventory-movement',
    icon: '',
    labelKey: 'Inventory Movement',
    permissions: [TModules.INVENTORY_VIEW],
}
export const INVENTORY_MOVEMENT_MANUAL: IMenu = {
    code: 'form',
    url: 'form',
    icon: '',
    labelKey: 'Manual Inventory Movement',
    permissions: [TModules.INVENTORY_CREATE],
}
export const INVENTORY_MOVEMENT_FORM: IMenu = {
    code: 'form',
    url: 'inventory-movement/form',
    icon: '',
    labelKey: 'Inventory Movement Form',
    permissions: [TModules.INVENTORY_CREATE],
}
export const INVENTORY_MOVEMENT_DETAIL: IMenu = {
    code: 'inventory-movement-detail',
    url: 'inventory-movement/:inventory_movement_id',
    icon: '',
    labelKey: 'Inventory Movement Detail',
    permissions: [TModules.INVENTORY_VIEW],
}
export const INVENTORY_MOVEMENT_ITEM: IMenu = {
    code: 'inventory-movement-item',
    url: 'inventory-movement/:inventory_movement_id/:inventory_item_id',
    icon: '',
    labelKey: 'Inventory Movement Item',
    permissions: [TModules.INVENTORY_VIEW],
}
export const CATALOGUE: IMenu = {
    code: 'catalogue',
    url: 'catalogue',
    icon: 'nav-icon bi bi-journals',
    labelKey: 'Catalogue',
}
export const PRODUCT: IMenu = {
    code: 'product',
    url: 'product',
    icon: '',
    labelKey: 'Product',
    permissions: [TModules.PRODUCT_VIEW, TModules.PRODUCT_CREATE, TModules.PRODUCT_EDIT, TModules.PRODUCT_DELETE],
}
export const BRANDS: IMenu = {
    code: 'brand',
    url: 'brand',
    icon: '',
    labelKey: 'Brand',
    permissions: [TModules.BRAND_VIEW, TModules.BRAND_CREATE, TModules.BRAND_EDIT, TModules.BRAND_DELETE],
}

export const PROCUREMENT: IMenu = {
    code: 'procurement',
    url: 'procurement',
    icon: 'nav-icon bi bi-clipboard-plus',
    labelKey: 'Procurement',
}
export const PURCHASE_ORDER: IMenu = {
    code: 'purchase-order',
    url: 'purchase-order',
    icon: '',
    labelKey: 'Purchase Order',
    permissions: [TModules.PURCHASING_VIEW, TModules.PURCHASING_CREATE, TModules.PURCHASING_EDIT, TModules.PURCHASING_DELETE],
}
export const PURCHASE_ORDER_NEW: IMenu = {
    code: 'form',
    url: 'form/:step',
    icon: '',
    labelKey: 'New Purchase Order',
    permissions: [TModules.PURCHASING_CREATE, TModules.PURCHASING_EDIT],
}
export const PURCHASE_ORDER_EDIT: IMenu = {
    code: 'form',
    url: 'form/:step/:po_id',
    icon: '',
    labelKey: 'Edit Purchase Order',
    permissions: [TModules.PURCHASING_CREATE, TModules.PURCHASING_EDIT],
}
export const PURCHASE_ORDER_DETAIL: IMenu = {
    code: 'detail',
    url: 'detail/:po_id',
    icon: '',
    labelKey: 'Purchase Order Detail',
    permissions: [TModules.PURCHASING_VIEW],
}
export const RECEIVE_ORDER: IMenu = {
    code: 'receive-order',
    url: 'receive-order',
    icon: '',
    labelKey: 'Receive Order',
    permissions: [TModules.PURCHASING_RECEIVE_VIEW],
}
export const RECEIVE_ORDER_DETAIL: IMenu = {
    code: 'detail',
    url: 'detail/:po_id',
    icon: '',
    labelKey: 'Purchase Order Detail',
    permissions: [TModules.PURCHASING_RECEIVE_VIEW],
}
export const PURCHASE_ORDER_RECEIVE: IMenu = {
    code: 'receive',
    url: 'detail/:po_id/receive',
    icon: '',
    labelKey: 'Receive Purchase Order',
    permissions: [TModules.PURCHASING_RECEIVE_CREATE],
}
export const SUPPLIERS: IMenu = {
    code: 'supplier',
    url: 'supplier',
    icon: '',
    labelKey: 'Suppliers',
    permissions: [TModules.SUPPLIER_VIEW, TModules.SUPPLIER_CREATE, TModules.SUPPLIER_EDIT, TModules.SUPPLIER_DELETE],
}
export const PRODUCTION: IMenu = {
    code: 'production',
    url: 'production',
    icon: '',
    labelKey: 'Production',
    permissions: [TModules.PRODUCTION_VIEW, TModules.PRODUCTION_CREATE, TModules.PRODUCTION_EDIT, TModules.PRODUCTION_DELETE],
}
export const PRODUCTION_FORM: IMenu = {
    code: 'form',
    url: 'production/form',
    icon: '',
    labelKey: 'Production Form',
    permissions: [TModules.PRODUCTION_CREATE, TModules.PRODUCTION_EDIT],
}
export const PRODUCTION_DETAIL: IMenu = {
    code: 'production-detail',
    url: 'production/detail/:id',
    icon: '',
    labelKey: 'Production Detail',
    permissions: [TModules.PRODUCTION_VIEW],
}

export const FINANCE: IMenu = {
    code: 'finance',
    url: 'finance',
    icon: 'nav-icon bi bi-coin',
    labelKey: 'Finance',
}
export const CASHFLOW: IMenu = {
    code: 'cashflow',
    url: 'cashflow',
    icon: '',
    labelKey: 'Cashflow',
    permissions: [TModules.CASHFLOW_VIEW],
}
export const CASHFLOW_DETAIL: IMenu = {
    code: 'cashflow-detail',
    url: 'cashflow/:accounting_id',
    icon: '',
    labelKey: 'Cashflow Detail',
    permissions: [TModules.CASHFLOW_VIEW],
}
export const FINANCE_REPORT: IMenu = {
    code: 'finance-report',
    url: 'finance-report',
    icon: '',
    labelKey: 'Finance Report',
    permissions: [TModules.FINANCE_REPORT_VIEW],
}
export const EXPENSES: IMenu = {
    code: 'expenses',
    url: 'expenses',
    icon: '',
    labelKey: 'Expenses',
    permissions: [TModules.EXPENSES_VIEW, TModules.EXPENSES_CREATE, TModules.EXPENSES_EDIT, TModules.EXPENSES_DELETE],
}
export const EXPENSES_FORM: IMenu = {
    code: 'form',
    url: 'form',
    icon: '',
    labelKey: 'Expense Form',
    permissions: [TModules.EXPENSES_CREATE, TModules.EXPENSES_EDIT],
}
export const EXPENSES_EDIT: IMenu = {
    code: 'form',
    url: 'form/:expense_id',
    icon: '',
    labelKey: 'Expense Edit',
    permissions: [TModules.EXPENSES_EDIT],
}
export const EXPENSES_DETAIL: IMenu = {
    code: 'detail',
    url: 'detail/:expense_id',
    icon: '',
    labelKey: 'Expense Detail',
    permissions: [TModules.EXPENSES_VIEW],
}

export const ADMIN: IMenu = {
    code: 'admin',
    url: 'admin',
    icon: 'nav-icon bi bi-person-gear',
    labelKey: 'Admin',
}
export const ROLE: IMenu = {
    code: 'role',
    url: 'role',
    icon: '',
    labelKey: 'Role',
    permissions: [TModules.ROLE_VIEW, TModules.ROLE_CREATE, TModules.ROLE_EDIT, TModules.ROLE_DELETE]
}
export const ROLE_DETAIL: IMenu = {
    code: 'form',
    url: 'form/:role_id',
    icon: '',
    labelKey: 'Role Detail',
    permissions: [TModules.ROLE_VIEW],
}
export const ROLE_CREATE: IMenu = {
    code: 'form',
    url: 'form',
    icon: '',
    labelKey: 'Role Create',
    permissions: [TModules.ROLE_VIEW, TModules.ROLE_CREATE],
}
export const ROLE_EDIT: IMenu = {
    code: 'form',
    url: 'form/:role_id',
    icon: '',
    labelKey: 'Role Edit',
    permissions: [TModules.ROLE_VIEW, TModules.ROLE_EDIT],
}

export const USER: IMenu = {
    code: 'user',
    url: 'user',
    icon: '',
    labelKey: 'User',
    permissions: [TModules.USER_VIEW, TModules.USER_CREATE, TModules.USER_EDIT, TModules.USER_DELETE]
}

export const PROFILE: IMenu = {
    code: 'profile',
    url: 'profile',
    icon: '',
    labelKey: 'Profile',
}


export const DASHBOARD: IMenu = {
    code: 'dashboard',
    url: 'home',
    icon: 'nav-icon bi bi-speedometer',
    labelKey: 'Dashboard',
}

export const APPROVAL: IMenu = {
    code: 'approval',
    url: 'approval',
    icon: 'nav-icon bi bi-clipboard-check',
    labelKey: 'Approval',
    permissions: [TModules.APPROVAL_PURCHASING_VIEW, TModules.APPROVAL_EXPENSE_VIEW, TModules.APPROVAL_EXPENSE_CREATE]
}

export const INVESTMENT: IMenu = {
    code: 'investment',
    url: 'investment',
    icon: 'nav-icon bi bi-bank',
    labelKey: 'Investment',
    permissions: [TModules.INVESTMENT_VIEW]
}

// This is to manage menu UI, please make sure routers are matched
export const Menus: IMenu[] = [
    // TODO: remove this dummy later
    DASHBOARD,
    APPROVAL,
    INVESTMENT,
    {
        ...SALES,
        children: [
            CASHIER,
            SALES_HISTORY,
            SALE_STOCK
        ]
    },
    {
        ...SUPPLIES,
        children: [
            INVENTORY,
            {
                ...INVENTORY_MOVEMENT,
                children: [
                    INVENTORY_MOVEMENT_MANUAL
                ]
            },
            PRODUCTION
        ]
    },
    {
        ...PROCUREMENT,
        children: [
            PURCHASE_ORDER,
            RECEIVE_ORDER,
            SUPPLIERS
        ]
    },
    {
        ...CATALOGUE,
        children: [
            PRODUCT,
            BRANDS,
        ]
    },
    {
        ...FINANCE,
        children: [
            FINANCE_REPORT,
            CASHFLOW,
            EXPENSES,
        ]
    },
    {
        ...ADMIN,
        children: [
            {
                ...ROLE,
                children: [
                    ROLE_DETAIL,
                    ROLE_CREATE,
                    ROLE_EDIT
                ]
            },
            USER
        ]
    }
];
