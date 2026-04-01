import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleService } from '../services/sale-service/sale.service';
import { ISale } from '../../../types/interfaces/sales.interface';
import { ColumnProps, GenericTable } from '../../../shared/components/generic-table/generic-table';
import { buildSaleReceiptHtml, IReceiptGroupedItem } from '../utils/receipt.helper';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sales-history-detail',
  standalone: true,
  imports: [CommonModule, GenericTable, TranslateModule],
  templateUrl: './sales-history-detail.html',
  styleUrl: './sales-history-detail.scss',
})
export class SalesHistoryDetail implements OnInit {
  isLoading: boolean = false;
  @Input() custom?: boolean;
  @Input() saleDetail?: ISale;

  columns: Array<ColumnProps> = [
    { label: 'Barcode', id: 'barcode' },
    { label: 'Product Name', id: 'product_name' },
    { label: 'SKU', id: 'product_sku' },
    { label: 'Qty', id: 'item_qty' },
    { label: 'Price', id: 'sale_price', dataType: 'CURRENCY' },
    { label: 'Discount', id: 'discount_amount', dataType: 'CURRENCY' },
    { label: 'Net Total', id: 'net_price', dataType: 'CURRENCY' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private saleService: SaleService
  ) { }

  goBack() {
    window.history.back();
  }

  ngOnInit(): void {
    const saleId = this.route.snapshot.paramMap.get('sale_id');
    if (saleId) {
      this.getDetail(saleId);
    }
  }

  getDetail(id: string) {
    this.isLoading = true;
    this.saleService.getSellingDetail(id).subscribe({
      next: (res) => {
        this.saleDetail = res.detail;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  editSale() {
    if (!this.saleDetail?._id) {
      return;
    }

    this.router.navigate(['/cashier'], {
      queryParams: {
        sale_id: this.saleDetail._id,
        edit: '1'
      }
    });
  }

  printInvoice() {
    if (!this.saleDetail) {
      return;
    }

    const items = this.groupItemsForReceipt(this.saleDetail.items);
    const printWindow = window.open('', '_blank', 'width=420,height=720');
    if (!printWindow) {
      return;
    }

    const receiptHtml = buildSaleReceiptHtml(this.saleDetail, items);
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  private groupItemsForReceipt(items: ISale['items']) {
    const grouped: Record<string, IReceiptGroupedItem> = {};

    items.forEach((item) => {
      const key = typeof item.product === 'string' ? item.product : (item.product?._id || item.product_name);
      const salePrice = Number(item.sale_price || 0);

      if (!grouped[key]) {
        grouped[key] = {
          product_name: item.product_name,
          product_sku: item.product_sku,
          qty: 0,
          total: 0
        };
      }

      grouped[key].qty += 1;
      grouped[key].total += Number(item.net_price || salePrice || 0);
    });

    return Object.values(grouped);
  }
}
