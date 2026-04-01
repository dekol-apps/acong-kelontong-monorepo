import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaleService } from '../services/sale-service/sale.service';
import { ISale, ISaleStockSummary } from '../../../types/interfaces/sales.interface';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { ConfirmModal } from '../../../shared/components/modals/confirm-modal/confirm-modal';
import { decimalToNumber, roundMoney } from '../../../utils/helper';
import { defaultPpnRate } from '../../../types/constants/common.constants';
import { ActivatedRoute, Router } from '@angular/router';
import { buildSaleReceiptHtml, IReceiptGroupedItem } from '../utils/receipt.helper';
import { TranslateModule } from '@ngx-translate/core';

interface ICartItem extends ISaleStockSummary {
  qty: number;
  total: number;
}

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, FormsModule, GenericTable, TableColumn, ConfirmModal, TranslateModule],
  templateUrl: './cashier.html',
  styleUrl: './cashier.scss'
})
export class Cashier implements OnInit {
  @ViewChild('confirmModal') confirmModal!: ConfirmModal;

  isLoading: boolean = false;
  listStock: ISaleStockSummary[] = [];
  pagination: IPaginationInput = {
    page: 1,
    total: 0,
    size: 10,
    totalPages: 1
  };

  columns: Array<ColumnProps> = [
    { label: 'Barcode', id: 'barcode', sort: true },
    { label: 'Product Name', id: 'product_name', sort: true },
    { label: 'SKU', id: 'product_sku', sort: true },
    { label: 'Brand', id: 'brand_name', sort: true },
    { label: 'Stock', id: 'item_qty', sort: true },
    { label: 'Price', id: 'sale_price', dataType: 'CURRENCY' },
    { label: 'Action', id: 'action', customElementId: 'action' }
  ];

  cart: ICartItem[] = [];
  isEditMode: boolean = false;
  editSaleId: string = '';
  sourceSaleNumber: string = '';
  sourceCartQtyByProduct: Record<string, number> = {};
  lastProcessedSale?: ISale;

  totals = {
    subTotal: 0,
    ppnTotal: 0,
    discountTotal: 0,
    grandTotal: 0
  };

  decimalToNumber = decimalToNumber;

  stringify(val) {
    console.log('stringify', val);
    return JSON.stringify(val)
  }

  constructor(
    private saleService: SaleService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const saleId = this.route.snapshot.queryParamMap.get('sale_id');
    const isEdit = this.route.snapshot.queryParamMap.get('edit') === '1';

    if (saleId && isEdit) {
      this.isEditMode = true;
      this.editSaleId = saleId;
      this.loadEditSale(saleId);
    }

    this.getList({ page: 1, size: 10, search: '' });
  }

  getList(evt: ITableQueryData) {
    this.isLoading = true;
    this.saleService.getSaleStocks(evt).subscribe({
      next: (res) => {
        this.listStock = res.list;
        console.log('listStock', this.listStock)
        this.pagination = {
          page: res.meta?.page ?? 1,
          total: res.meta?.total ?? 0,
          size: res.meta?.size ?? 10,
          totalPages: res.meta?.totalPages ?? 1
        };
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  addToCart(item: ISaleStockSummary) {
    const existing = this.cart.find(c => c.product === item.product);

    if (this.isEditMode && !this.sourceCartQtyByProduct[item.product]) {
      return;
    }

    const maxQty = this.getMaxAllowedQty(item.product, item.total_qty);
    if (existing) {
      if (existing.qty < maxQty) {
        existing.qty++;
        this.calculateCart();
      }
    } else {
      if (maxQty > 0) {
        this.cart.push({ ...item, qty: 1, total: 0 });
        this.calculateCart();
      }
    }
  }

  updateQty(index: number, delta: number) {
    const item = this.cart[index];
    const newQty = item.qty + delta;
    const maxQty = this.getMaxAllowedQty(item.product, item.total_qty);

    if (newQty > 0 && newQty <= maxQty) {
      item.qty = newQty;
      this.calculateCart();
    } else if (newQty === 0) {
      this.removeFromCart(index);
    }
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
    this.calculateCart();
  }

  calculateCart() {
    let subTotal = 0;
    let ppnTotal = 0;
    let discountTotal = 0;

    this.cart.forEach(item => {
      const price = decimalToNumber(item.sale_price);
      const discountPercent = item.discount_percent || 0;

      const itemTotalBeforeDiscount = roundMoney(price * item.qty);
      const itemDiscountAmount = roundMoney(itemTotalBeforeDiscount * (discountPercent / 100));
      const itemNetPrice = roundMoney(itemTotalBeforeDiscount - itemDiscountAmount);

      const base = roundMoney(itemNetPrice / (1 + defaultPpnRate / 100));
      const ppn = roundMoney(itemNetPrice - base);

      item.total = itemNetPrice;
      subTotal = roundMoney(subTotal + base);
      ppnTotal = roundMoney(ppnTotal + ppn);
      discountTotal = roundMoney(discountTotal + itemDiscountAmount);
    });

    this.totals.subTotal = subTotal;
    this.totals.ppnTotal = ppnTotal;
    this.totals.discountTotal = discountTotal;
    this.totals.grandTotal = roundMoney(subTotal + ppnTotal);
  }

  confirmSelling() {
    this.confirmModal.show({
      itemName: 'this transaction',
      type: 'action',
      customText: this.isEditMode
        ? `Are you sure you want to update this sale? Grand Total: IDR ${this.totals.grandTotal.toLocaleString()}`
        : `Are you sure you want to execute this sale? Grand Total: IDR ${this.totals.grandTotal.toLocaleString()}`
    }).then(ok => {
      if (ok) {
        this.executeSelling();
      }
    });
  }

  executeSelling() {
    const payload = {
      items: this.cart.map(c => ({
        product: c.product,
        item_qty: c.qty
      }))
    };

    const request$ = this.isEditMode
      ? this.saleService.editSelling(this.editSaleId, payload)
      : this.saleService.selling(payload);

    this.isLoading = true;
    request$.subscribe({
      next: (res) => {
        this.lastProcessedSale = res?.detail;

        if (!this.isEditMode) {
          this.cart = [];
          this.calculateCart();
        }

        this.getList({ page: this.pagination.page, size: this.pagination.size, search: '' });

        if (this.isEditMode && this.lastProcessedSale?._id) {
          this.router.navigate(['/sales-history', this.lastProcessedSale._id]);
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  printLastReceipt() {
    if (!this.lastProcessedSale) {
      return;
    }

    const groupedItems = this.groupItemsForReceipt(this.lastProcessedSale.items);
    const printWindow = window.open('', '_blank', 'width=420,height=720');
    if (!printWindow) {
      return;
    }

    printWindow.document.write(buildSaleReceiptHtml(this.lastProcessedSale, groupedItems));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  private loadEditSale(saleId: string) {
    this.isLoading = true;
    this.saleService.getSellingDetail(saleId).subscribe({
      next: (res) => {
        const detail = res.detail;
        this.sourceSaleNumber = detail.sale_number;

        const grouped: Record<string, ICartItem> = {};
        const sourceQty: Record<string, number> = {};

        detail.items.forEach((item) => {
          const productId = typeof item.product === 'string' ? item.product : (item.product?._id as string);
          if (!grouped[productId]) {
            grouped[productId] = {
              product: productId,
              product_name: item.product_name,
              product_sku: item.product_sku,
              brand_name: item.brand_name,
              barcode: item.barcode,
              sale_price: item.sale_price,
              discount_percent: item.discount_percent,
              item_qty: 0,
              total_qty: 0,
              qty: 0,
              total: 0
            };
            sourceQty[productId] = 0;
          }

          grouped[productId].qty += 1;
          grouped[productId].item_qty += 1;
          grouped[productId].total_qty += 1;
          sourceQty[productId] += 1;
        });

        this.sourceCartQtyByProduct = sourceQty;
        this.cart = Object.values(grouped);
        this.calculateCart();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private getMaxAllowedQty(productId: string, stockQty: number): number {
    if (!this.isEditMode) {
      return stockQty;
    }

    return this.sourceCartQtyByProduct[productId] ?? 0;
  }

  private groupItemsForReceipt(items: ISale['items']) {
    const grouped: Record<string, IReceiptGroupedItem> = {};

    items.forEach((item) => {
      const key = typeof item.product === 'string' ? item.product : (item.product?._id || item.product_name);
      const net = Number(item.net_price || item.sale_price || 0);

      if (!grouped[key]) {
        grouped[key] = {
          product_name: item.product_name,
          product_sku: item.product_sku,
          qty: 0,
          total: 0
        };
      }

      grouped[key].qty += 1;
      grouped[key].total += net;
    });

    return Object.values(grouped);
  }
}
