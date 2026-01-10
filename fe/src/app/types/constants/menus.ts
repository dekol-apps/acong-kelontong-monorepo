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
    labelKey: 'Cashier',
    permissions: ['cashier.view', 'cashier.create', 'cashier.edit', 'cashier.delete'],
};
export const SALES_HISTORY: IMenu = {
    code: 'sales-history',
    url: 'sales-history',
    icon: '',
    labelKey: 'Sales History',
    permissions: ['cashier.view', 'cashier.create', 'cashier.edit', 'cashier.delete'],
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
export const SHOWCASE: IMenu = {
    code: 'showcase',
    url: 'showcase',
    icon: '',
    labelKey: 'Showcase',
    permissions: ['showcase.view', 'showcase.create', 'showcase.edit', 'showcase.delete'],
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
    url: 'form',
    icon: '',
    labelKey: 'New Purchase Order',
    permissions: ['purchasing.create', 'purchasing.edit'],
}
export const PURCHASE_ORDER_EDIT: IMenu = {
    code: 'form',
    url: 'form/:po_id',
    icon: '',
    labelKey: 'Edit Purchase Order',
    permissions: ['purchasing.create', 'purchasing.edit'],
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
    permissions: ['cashflow.view', 'cashflow.create', 'cashflow.edit', 'cashflow.delete'],
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
    permissions: ['capital.view', 'capital.create', 'capital.edit', 'capital.delete'],
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
            SHOWCASE
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
