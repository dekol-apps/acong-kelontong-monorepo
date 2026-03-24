import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AccountingService } from '../../../services/accounting/accounting.service';
import { IAccounting } from '../../../types/interfaces/finance.interface';
import { FlowType } from '../../../types/enums/common.enum';

@Component({
  selector: 'app-cashflow-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './cashflow-detail.html',
  styleUrl: './cashflow-detail.scss',
})
export class CashflowDetail implements OnInit {
  isLoading = false;
  detail?: IAccounting;
  FlowType = FlowType;

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

  goBack() {
    window.history.back();
  }
}
