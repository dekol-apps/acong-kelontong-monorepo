import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaleService } from '../services/sale-service/sale.service';
import { ISaleStockSummary } from '../../../types/interfaces/sales.interface';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { ConfirmModal } from '../../../shared/components/modals/confirm-modal/confirm-modal';
import { decimalToNumber, roundMoney } from '../../../utils/helper';
import { defaultPpnRate } from '../../../types/constants/common.constants';

interface ICartItem extends ISaleStockSummary {
  qty: number;
  total: number;
}

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, FormsModule, GenericTable, TableColumn, ConfirmModal],
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
    { label: 'Brand', id: 'brand_name', sort: true },
    { label: 'Stock', id: 'item_qty', sort: true },
    { label: 'Price', id: 'sale_price', dataType: 'CURRENCY' },
    { label: 'Action', id: 'action', customElementId: 'action' }
  ];

  cart: ICartItem[] = [];
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

  constructor(private saleService: SaleService) { }

  ngOnInit(): void {
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
    if (existing) {
      if (existing.qty < item.total_qty) {
        existing.qty++;
        this.calculateCart();
      }
    } else {
      this.cart.push({ ...item, qty: 1, total: 0 });
      this.calculateCart();
    }
  }

  updateQty(index: number, delta: number) {
    const item = this.cart[index];
    const newQty = item.qty + delta;
    if (newQty > 0 && newQty <= item.total_qty) {
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
      customText: `Are you sure you want to execute this sale? Grand Total: IDR ${this.totals.grandTotal.toLocaleString()}`
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

    this.saleService.selling(payload).subscribe({
      next: () => {
        this.cart = [];
        this.calculateCart();
        this.getList({ page: this.pagination.page, size: this.pagination.size, search: '' });
      }
    });
  }
}
