import { IMenu } from "../interfaces/menu.interface";

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
    permissions: ['sale.view', 'sale.create', 'sale.edit', 'sale.delete'],
};
export const SALES_HISTORY: IMenu = {
    code: 'sales-history',
    url: 'sales-history',
    icon: '',
    permissions: ['sale.view', 'sale.create', 'sale.edit', 'sale.delete'],
};

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
    permissions: ['inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete'],
}
export const INVENTORY_PRODUCT: IMenu = {
    code: 'inventory-product',
    url: 'inventory/:product_id',
    icon: '',
    labelKey: 'Inventory Product',
    permissions: ['inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete'],
}
export const INVENTORY_ITEM: IMenu = {
    code: 'inventory-item',
    url: 'inventory/:product_id/:inventory_item_id',
    icon: '',
    labelKey: 'Inventory Item',
    permissions: ['inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete'],
}
export const SHOWCASE: IMenu = {
    code: 'showcase',
    url: 'showcase',
    icon: '',
    labelKey: 'Showcase',
    permissions: ['inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete'],
}
export const INVENTORY_MOVEMENT: IMenu = {
    code: 'inventory-movement',
    url: 'inventory-movement',
    icon: '',
    labelKey: 'Inventory Movement',
    permissions: ['inventory.view'],
}
export const INVENTORY_MOVEMENT_DETAIL: IMenu = {
    code: 'inventory-movement-detail',
    url: 'inventory-movement/:inventory_movement_id',
    icon: '',
    labelKey: 'Inventory Movement Detail',
    permissions: ['inventory.view'],
}
export const INVENTORY_MOVEMENT_ITEM: IMenu = {
    code: 'inventory-movement-item',
    url: 'inventory-movement/:inventory_movement_id/:inventory_item_id',
    icon: '',
    labelKey: 'Inventory Movement Item',
    permissions: ['inventory.view'],
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
    permissions: ['product.view', 'product.create', 'product.edit', 'product.delete'],
}
export const BRANDS: IMenu = {
    code: 'brand',
    url: 'brand',
    icon: '',
    labelKey: 'Brand',
    permissions: ['brand.view', 'brand.create', 'brand.edit', 'brand.delete'],
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
    permissions: ['purchasing.view', 'purchasing.create', 'purchasing.edit', 'purchasing.delete'],
}
export const PURCHASE_ORDER_NEW: IMenu = {
    code: 'form',
    url: 'form/:step',
    icon: '',
    labelKey: 'New Purchase Order',
    permissions: ['purchasing.create', 'purchasing.edit'],
}
export const PURCHASE_ORDER_EDIT: IMenu = {
    code: 'form',
    url: 'form/:step/:po_id',
    icon: '',
    labelKey: 'Edit Purchase Order',
    permissions: ['purchasing.create', 'purchasing.edit'],
}
export const PURCHASE_ORDER_DETAIL: IMenu = {
    code: 'detail',
    url: 'detail/:po_id',
    icon: '',
    labelKey: 'Purchase Order Detail',
    permissions: ['purchasing.view'],
}
export const PURCHASE_ORDER_RECEIVE: IMenu = {
    code: 'receive',
    url: 'receive/:purchase_id',
    icon: '',
    labelKey: 'Receive Purchase Order',
    permissions: ['purchasing.edit', 'inventory.create'],
}
export const RECEIVE_ORDER: IMenu = {
    code: 'receive-order',
    url: 'receive-order',
    icon: '',
    labelKey: 'Receive Order',
    permissions: ['purchasing.view', 'inventory.create', 'purchasing.edit'],
}
export const SUPPLIERS: IMenu = {
    code: 'supplier',
    url: 'supplier',
    icon: '',
    labelKey: 'Suppliers',
    permissions: ['supplier.view', 'supplier.create', 'supplier.edit', 'supplier.delete'],
}
export const SUPPLIES_PRODUCTION: IMenu = {
    code: 'production',
    url: 'production',
    icon: '',
    labelKey: 'Production',
    permissions: ['production.view', 'production.create', 'production.edit', 'production.delete'],
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
    permissions: ['cashflow.view'],
}
export const EXPENSES: IMenu = {
    code: 'expenses',
    url: 'expenses',
    icon: '',
    labelKey: 'Expenses',
    permissions: ['expenses.view', 'expenses.create', 'expenses.edit', 'expenses.delete'],
}
export const CAPITAL: IMenu = {
    code: 'capital',
    url: 'capital',
    icon: '',
    labelKey: 'Capital Account',
    permissions: ['investment.view'],
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
    permissions: ['role.view', 'role.create', 'role.edit', 'role.delete']
}
export const ROLE_DETAIL: IMenu = {
    code: 'form',
    url: 'form/:role_id',
    icon: '',
    labelKey: 'Role Detail',
    permissions: ['role.view'],
}
export const ROLE_CREATE: IMenu = {
    code: 'form',
    url: 'form',
    icon: '',
    labelKey: 'Role Create',
    permissions: ['role.view', 'role.create'],
}
export const ROLE_EDIT: IMenu = {
    code: 'form',
    url: 'form/:role_id',
    icon: '',
    labelKey: 'Role Edit',
    permissions: ['role.view', 'role.edit'],
}

export const USER: IMenu = {
    code: 'user',
    url: 'user',
    icon: '',
    labelKey: 'User',
    permissions: ['user.view', 'user.create', 'user.edit', 'user.delete']
}

export const DASHBOARD: IMenu = {
    code: 'dashboard',
    url: 'home',
    icon: 'nav-icon bi bi-speedometer',
    labelKey: 'Dashboard',
    permissions: ['dashboard.view']
}

export const APPROVAL: IMenu = {
    code: 'approval',
    url: 'approval',
    icon: 'nav-icon bi bi-clipboard-check',
    labelKey: 'Approval',
    permissions: ['approval.view']
}

export const INVESTMENT: IMenu = {
    code: 'investment',
    url: 'investment',
    icon: 'nav-icon bi bi-bank',
    labelKey: 'Investment',
    permissions: ['investment.view']
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
            SALES_HISTORY
        ]
    },
    {
        ...SUPPLIES,
        children: [
            INVENTORY,
            INVENTORY_MOVEMENT,
            SHOWCASE,
            SUPPLIES_PRODUCTION
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
            CASHFLOW,
            EXPENSES,
            CAPITAL
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
