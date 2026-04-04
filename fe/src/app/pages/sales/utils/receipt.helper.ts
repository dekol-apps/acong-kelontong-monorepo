import { ISale } from '../../../types/interfaces/sales.interface';

export interface IReceiptGroupedItem {
  product_name: string;
  product_sku?: string;
  qty: number;
  total: number;
}

export function buildSaleReceiptHtml(sale: ISale, items: IReceiptGroupedItem[]): string {
  const createdAt = sale.createdAt ? new Date(sale.createdAt) : new Date();
  const formatCurrency = (value: number | string) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(Number(value || 0));

  const rows = items.map((item) => `
      <tr>
        <td>${item.product_name}<br/><small>SKU: ${item.product_sku || '-'}</small></td>
        <td style="text-align:center;">${item.qty}</td>
        <td style="text-align:right;">${formatCurrency(item.total)}</td>
      </tr>
    `).join('');

  return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Receipt ${sale.sale_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 16px; color: #111; }
            .center { text-align: center; }
            .muted { color: #555; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { font-size: 12px; padding: 6px 0; border-bottom: 1px dashed #ccc; }
            .totals { margin-top: 12px; font-size: 12px; }
            .totals div { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .grand { font-size: 14px; font-weight: 700; border-top: 1px solid #111; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="center">
            <h3 style="margin: 0;">Acong Kelontong</h3>
            <div class="muted">${createdAt.toLocaleString('id-ID')}</div>
            <div class="muted">Invoice: ${sale.sale_number}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="text-align:left;">Item</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="totals">
            <div><span>Sub Total</span><span>${formatCurrency(sale.total_before_tax)}</span></div>
            <div><span>PPN (${sale.ppn_rate}%)</span><span>${formatCurrency(sale.total_ppn)}</span></div>
            <div><span>Discount</span><span>-${formatCurrency(sale.total_discount)}</span></div>
            <div class="grand"><span>Grand Total</span><span>${formatCurrency(sale.grand_total)}</span></div>
          </div>
          <p class="center muted" style="margin-top: 20px;">Thank you for shopping</p>
        </body>
      </html>
    `;
}
