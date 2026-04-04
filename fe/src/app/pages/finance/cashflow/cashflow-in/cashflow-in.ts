import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccountingService } from '../../../../services/accounting/accounting.service';
import { GenericTable, ColumnProps, ITableQueryData } from '../../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../../shared/directives/table-column/table-column';
import { FlowType } from '../../../../types/enums/common.enum';
import { IPaginationInput } from '../../../../types/interfaces/common.interface';
import { IAccounting } from '../../../../types/interfaces/finance.interface';

@Component({
  selector: 'app-cashflow-in',
  imports: [CommonModule, RouterModule, GenericTable, TableColumn],
  standalone: true,
  templateUrl: './cashflow-in.html',
  styleUrl: './cashflow-in.scss',
})
export class CashflowIn implements OnInit {

  isLoading = false;
  listAccounting: IAccounting[] = [];
  pagination: IPaginationInput = { page: 1, total: 0, size: 10, totalPages: 1 };

  columns: Array<ColumnProps> = [
    { label: 'Record Date', id: 'record_date', dataType: 'DATE', sort: true },
    { label: 'Order Type', id: 'order_type' },
    { label: 'Transaction Amount', id: 'transaction_amount', customElementId: 'amount' },
    { label: 'PPn Amount', id: 'ppn_amount' },
    { label: 'Tax Facture Number', id: 'tax_facture_number' },
    { label: 'Action', id: 'action', customElementId: 'action' },
  ];

  constructor(
    private accountingService: AccountingService
  ) { }

  ngOnInit(): void {
    this.getList({ page: 1, size: 10 });
  }

  getList(evt: ITableQueryData) {
    this.isLoading = true;
    this.accountingService.listHistory({
      page: evt.page,
      size: evt.size,
      flow_type: FlowType.IN,
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
}
