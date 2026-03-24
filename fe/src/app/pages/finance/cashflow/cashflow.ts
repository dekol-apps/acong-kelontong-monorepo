import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AccountingService } from '../../../services/accounting/accounting.service';
import { IAccounting } from '../../../types/interfaces/finance.interface';
import { FlowType } from '../../../types/enums/common.enum';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';

@Component({
  selector: 'app-cashflow',
  imports: [CommonModule, RouterModule, GenericTable, TableColumn],
  templateUrl: './cashflow.html',
  styleUrl: './cashflow.scss'
})
export class Cashflow implements OnInit {
  FlowType = FlowType;
  activeTab: FlowType = FlowType.IN;

  isLoading = false;
  listAccounting: IAccounting[] = [];
  pagination: IPaginationInput = { page: 1, total: 0, size: 10, totalPages: 1 };

  columnsIn: Array<ColumnProps> = [
    { label: 'Date', id: 'record_date', dataType: 'DATE', sort: true },
    { label: 'Type', id: 'order_type', customElementId: 'order_type' },
    { label: 'Amount', id: 'transaction_amount', customElementId: 'amount' },
    { label: 'Action', id: 'action', customElementId: 'action' },
  ];

  columnsOut: Array<ColumnProps> = [
    { label: 'Date', id: 'record_date', dataType: 'DATE', sort: true },
    { label: 'Type', id: 'order_type', customElementId: 'order_type' },
    { label: 'Amount', id: 'transaction_amount', customElementId: 'amount' },
    { label: 'Action', id: 'action', customElementId: 'action' },
  ];

  private accountingService = inject(AccountingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lastQuery?: ITableQueryData;

  get activeColumns() {
    return this.activeTab === FlowType.IN ? this.columnsIn : this.columnsOut;
  }

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('flow_type');
    if (tab === FlowType.OUT) {
      this.activeTab = FlowType.OUT;
    }
    this.getList({ page: 1, size: 10 });
  }

  setTab(tab: FlowType) {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.router.navigate([], { queryParams: { flow_type: tab }, replaceUrl: true });
    this.getList(this.lastQuery ?? { page: 1, size: 10 });
  }

  getList(evt: ITableQueryData) {
    this.lastQuery = evt;
    this.isLoading = true;
    this.accountingService.listHistory({
      page: evt.page,
      size: evt.size,
      flow_type: this.activeTab,
      search: evt.search,
      sortBy: evt.sortBy,
      sortDir: evt.sortDir,
    }).subscribe({
      next: (res) => {
        this.listAccounting = res.list ?? [];
        this.pagination = {
          page: res.meta?.page ?? 1,
          total: res.meta?.total ?? 0,
          size: res.meta?.size ?? 10,
          totalPages: res.meta?.totalPages ?? 1,
        };
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getAmount(item: IAccounting): number {
    const raw = item.transaction_amount;
    if (typeof raw === 'object' && raw !== null && '$numberDecimal' in raw) {
      return parseFloat((raw as { $numberDecimal: string }).$numberDecimal);
    }
    return Number(raw) || 0;
  }

  getOrderTypeBadge(orderType: string): string {
    const map: Record<string, string> = {
      PURCHASING: 'warning',
      SALE: 'success',
      EXPENSE: 'danger',
      DEPOSIT: 'primary',
      WITHDRAWAL: 'secondary',
      ADJUSTMENT: 'info',
      PRODUCTION: 'dark',
    };
    return map[orderType] || 'light';
  }
}
