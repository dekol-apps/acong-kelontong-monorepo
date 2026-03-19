import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'purchase-order/form/:step/:po_id',
    renderMode: RenderMode.Client
  },
  {
    path: 'role/form/:role_id',
    renderMode: RenderMode.Client
  },
  {
    path: 'user-verification/:ticket',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
