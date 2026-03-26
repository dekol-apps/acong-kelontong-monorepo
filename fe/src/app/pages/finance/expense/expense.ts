import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { IPaginationInput, ISelectFilter } from '../../../types/interfaces/common.interface';
import { ExpenseEn, IExpense } from '../../../types/interfaces/expense.interface';
import { ExpenseService } from './expense.service';

@Component({
  selector: 'app-expense',
  imports: [GenericTable, TableColumn, RouterLink],
  templateUrl: './expense.html',
  styleUrl: './expense.scss'
})
export class Expense implements OnInit {
  isLoading = false;
  listExpense: IExpense[] = [];
  pagination: IPaginationInput = {
    page: 1,
    total: 100,
    size: 10,
    totalPages: 1
  };

  filterSelect: ISelectFilter = {
    title: 'Filter status',
    selectOptions: [
      { label: ExpenseEn.CREATE, value: ExpenseEn.CREATE },
      { label: ExpenseEn.REQUEST, value: ExpenseEn.REQUEST },
      { label: ExpenseEn.APPROVE, value: ExpenseEn.APPROVE },
      { label: ExpenseEn.REJECT, value: ExpenseEn.REJECT },
      { label: ExpenseEn.COMPLETE, value: ExpenseEn.COMPLETE },
      { label: ExpenseEn.DROP, value: ExpenseEn.DROP },
    ]
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
      dataType: 'CURRENCY',
      sort: true
    },
    {
      label: 'Created Date',
      id: 'createdAt',
      extraHeaderClass: 'uppercase-text',
      dataType: 'DATE',
      sort: true
    },
    {
      label: 'Action',
      id: 'action',
      extraHeaderClass: 'uppercase-text w-100 d-flex justify-content-end',
      customElementId: 'action'
    }
  ];

  defaultQuery = {
    page: this.pagination.page,
    size: this.pagination.size,
    search: '',
  };

  ExpenseEn = ExpenseEn;

  constructor(private expenseService: ExpenseService) {}

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
    };

    if (evt.filterByDateVal?.start_date && evt.filterByDateVal?.end_date) {
      qParams.start_date = evt.filterByDateVal.start_date.toISOString();
      qParams.end_date = evt.filterByDateVal.end_date.toISOString();
    }
    if (evt.filterSelectVal?.value) {
      qParams.status = evt.filterSelectVal.value;
    }

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

}
