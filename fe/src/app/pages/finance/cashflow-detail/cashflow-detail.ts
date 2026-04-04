import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AccountingService } from '../../../services/accounting/accounting.service';
import { IAccounting } from '../../../types/interfaces/finance.interface';
import { FlowType, OrderType } from '../../../types/enums/common.enum';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cashflow-detail',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './cashflow-detail.html',
  styleUrl: './cashflow-detail.scss',
})
export class CashflowDetail implements OnInit {
  isLoading = false;
  detail?: IAccounting;
  FlowType = FlowType;
  OrderType = OrderType

  private route = inject(ActivatedRoute);
  private accountingService = inject(AccountingService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('accounting_id');
    if (id) {
      this.getDetail(id);
    }
  }

  getDetail(id: string) {
    this.isLoading = true;
    this.accountingService.getDetail(id).subscribe({
      next: (res) => {
        this.detail = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getAmount(item?: IAccounting): number {
    if (!item) return 0;
    const raw = item.transaction_amount;
    if (typeof raw === 'object' && raw !== null && '$numberDecimal' in raw) {
      return parseFloat((raw as { $numberDecimal: string }).$numberDecimal);
    }
    return Number(raw) || 0;
  }

  getDecimalValue(field: { $numberDecimal: string } | undefined): number {
    if (!field) return 0;
    return parseFloat(field.$numberDecimal) || 0;
  }

  getOrderTypeBadge(orderType?: string): string {
    const map: Record<string, string> = {
      PURCHASING: 'warning',
      SALE: 'success',
      EXPENSE: 'danger',
      DEPOSIT: 'primary',
      WITHDRAWAL: 'secondary',
      ADJUSTMENT: 'info',
      PRODUCTION: 'dark',
    };
    return orderType ? (map[orderType] || 'light') : 'light';
  }

  getOrderDetailPath(): string | null {
    if (!this.detail?.order_id) {
      return null;
    }

    switch (this.detail.order_type) {
      case OrderType.SALE:
        return `/sales-history/${this.detail.order_id}`;
      case OrderType.PURCHASING:
        return `/purchase-order/detail/${this.detail.order_id}`;
      case OrderType.EXPENSE:
        return `/expenses/detail/${this.detail.order_id}`;
      case OrderType.PRODUCTION:
        return `/production/detail/${this.detail.order_id}`;
      case OrderType.DEPOSIT:
      case OrderType.WITHDRAWAL:
        return `/inventory-movement/${this.detail.order_id}`;
      default:
        return null;
    }
  }

  getOrderDetailTitle(): string {
    const orderType = this.detail?.order_type || 'Order';
    return `${orderType} Detail`;
  }

  goBack() {
    window.history.back();
  }
}
