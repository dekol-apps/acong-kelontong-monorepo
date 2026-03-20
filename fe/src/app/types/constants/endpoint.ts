import { environment } from '../../../environments/environment';

const api = `${environment.apiUrl}/`;

export const Endpoint = {
  ACCOUNTING: `${api}accounting`,

  INVESTMENT: `${api}investment`,
  INVESTMENT_ID: (id: string) => {
    return `${api}investment/${id}`
  },

  /* Auth endpoints */
  LOGIN: `${api}auth/login`,
  LOGOUT: `${api}auth/logout`,
  REFRESH: `${api}auth/refresh`,

  USER: `${api}user`,
  USER_ID: (id: string) => {
    return `${api}user/detail/${id}`
  },
  USER_ID_REINVITE: (id: string) => {
    return `${api}user/detail/${id}/re-invite`
  },
  USER_ID_ROLE: (id: string) => {
    return `${api}user/detail/${id}/role`
  },
  USER_VERIFY: `${api}user/verify`,

  ROLE: `${api}role`,
  ROLE_ID: (id: string) => {
    return `${api}role/${id}`
  },

  /* Admin endpoints */
  PERMISSIONS: `${api}global/permissions`,

  // Brand Endpoint
  BRAND: `${api}brand`,
  BRAND_ID: (id: string) => {
    return `${api}brand/${id}`
  },

  // Product Endpoint
  PRODUCT: `${api}product`,
  PRODUCT_ID: (id: string) => {
    return `${api}product/${id}`
  },

  // Supplier Endpoint
  SUPPLIER: `${api}supplier`,
  SUPPLIER_ID: (id: string) => {
    return `${api}supplier/${id}`
  },

  PURCHASING: `${api}purchasing`,
  PURCHASING_ID: (id: string) => {
    return `${api}purchasing/${id}`
  },
  PURCHASING_REQUEST: (id: string) => `${api}purchasing/${id}/request`,
  PURCHASING_APPROVAL: (id: string) => `${api}purchasing/${id}/approval`,
  PURCHASING_PROCESS: (id: string) => `${api}purchasing/${id}/process`,
  PURCHASING_DROP: (id: string) => `${api}purchasing/${id}/drop`,
  PURCHASING_PAYMENT: (id: string) => `${api}purchasing/${id}/payment`,
  PURCHASING_RECEIVE: (id: string) => `${api}purchasing/${id}/receive`,
  PURCHASING_ITEM: `${api}purchasing-item`,
  PURCHASING_ITEM_ID: (id: string) => {
    return `${api}purchasing-item/${id}`
  },

  // Inventory Item Endpoint
  INVENTORY_ITEM: `${api}inventory-item`,
  INVENTORY_ITEM_PRODUCT_ID: (id: string) => `${api}inventory-item/product/${id}`,
  INVENTORY_ITEM_ID: (id: string) => `${api}inventory-item/item/${id}`,
  INVENTORY_RECONCILE: `${api}inventory-item/reconcile`,

  // /* Account endpoints */
  // ACCOUNT_SETUP: `${api}account/setup`,
  // ACCOUNT_PROFILE: `${api}account/profile`,
  // CHANGE_PASSWORD: `${api}account/change-password`,
  // CHANGE_EMAIL: `${api}account/change-email`,

  // VERIFY_FORGOT_PASSWORD: `${api}auth/forgot-password/verify/`,
  // FORGOT_PASSWORD: `${api}auth/forgot-password`,
  // REFRESH_TOKEN: `${api}auth/refresh-token`,
  // RESEND_VERIF: `${api}auth/signup/resend-verification`,
  // RESEND_VERIF_CHANGE_EMAIL: `${api}auth/signup/resend-verification`,
  // SIGN_UP: `${api}auth/signup`,
}
