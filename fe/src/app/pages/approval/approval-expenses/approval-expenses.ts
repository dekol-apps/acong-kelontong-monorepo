import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmModal } from '../../../shared/components/modals/confirm-modal/confirm-modal';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { IPaginationInput, ISelectFilter } from '../../../types/interfaces/common.interface';
import { ExpenseEn, IExpense } from '../../../types/interfaces/expense.interface';
import { ExpenseService } from '../../finance/expense/expense.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-approval-expenses',
  imports: [GenericTable, TableColumn, RouterLink, ConfirmModal, FormsModule],
  standalone: true,
  templateUrl: './approval-expenses.html',
  styleUrl: './approval-expenses.scss'
})
export class ApprovalExpenses implements OnInit {
  @ViewChild('RejectModal') confirmReject?: ConfirmModal;

  isLoading = false;
  listExpense: IExpense[] = [];
  pagination: IPaginationInput = {
    page: 1,
    total: 100,
    size: 10,
    totalPages: 1
  };

  columns: Array<ColumnProps> = [
    {
      label: 'Subject',
      id: 'subject',
      extraHeaderClass: 'uppercase-text',
      sort: true
    },
    {
      label: 'Expense Date',
      id: 'expense_date',
      extraHeaderClass: 'uppercase-text',
      dataType: 'DATE',
      sort: true
    },
    {
      label: 'Status',
      id: 'status',
      extraHeaderClass: 'uppercase-text',
      sort: true
    },
    {
      label: 'Amount',
      id: 'transaction_amount',
      extraHeaderClass: 'uppercase-text',
      dataType: 'CURRENCY'
    },
    {
      label: 'Action',
      id: 'action',
      extraHeaderClass: 'uppercase-text w-100 d-flex justify-content-end',
      customElementId: 'action'
    }
  ];

  filterSelect: ISelectFilter = {
    title: 'Filter status',
    value: { label: ExpenseEn.REQUEST, value: ExpenseEn.REQUEST },
    selectOptions: [
      { label: ExpenseEn.REQUEST, value: ExpenseEn.REQUEST },
      { label: ExpenseEn.APPROVE, value: ExpenseEn.APPROVE },
      { label: ExpenseEn.REJECT, value: ExpenseEn.REJECT },
    ]
  };

  defaultQuery = {
    page: this.pagination.page,
    size: this.pagination.size,
    search: '',
    filterSelectVal: this.filterSelect.value
  };

  rejectNotes = '';
  activeExpenseId = '';

  ExpenseEn = ExpenseEn;

  constructor(private expenseService: ExpenseService, private alert: AlertService) {}

  ngOnInit(): void {
    this.getList(this.defaultQuery);
  }

  getList(evt: ITableQueryData) {
    this.isLoading = true;
    const qParams: any = {
      page: evt.page,
      size: evt.size,
      sortBy: evt.sortBy,
      sortDir: evt.sortDir,
      search: evt.search,
      status: evt.filterSelectVal?.value ?? ExpenseEn.REQUEST,
    };

    this.expenseService.getExpenses(qParams).subscribe({
      next: (res) => {
        this.listExpense = res.list ?? [];
        this.pagination = {
          page: res.meta?.page ?? 1,
          total: res.meta?.total ?? 0,
          size: res.meta?.size ?? 10,
          totalPages: res.meta?.totalPages ?? 1
        };
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  approveExpense(expenseId: string) {
    this.expenseService.approveExpense(expenseId).subscribe(() => {
      this.alert.success('Expense approved successfully');
      this.getList(this.defaultQuery);
    });
  }

  rejectExpense(expenseId: string) {
    this.activeExpenseId = expenseId;
    this.rejectNotes = '';
    this.confirmReject?.show().then((res: any) => {
      if (!res) return;
      this.expenseService.rejectExpense(this.activeExpenseId, this.rejectNotes).subscribe(() => {
        this.alert.success('Expense rejected successfully');
        this.getList(this.defaultQuery);
      });
    });
  }

}
