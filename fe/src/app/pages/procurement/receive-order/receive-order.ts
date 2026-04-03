import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { IPaginationInput, ISelectFilter } from '../../../types/interfaces/common.interface';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { IPurchasing, PaymentStatusEn, PurchasingEn } from '../../../types/interfaces/procurement.interface';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { SelectFilter } from '../../../shared/components/select-filter/select-filter';

@Component({
  selector: 'app-receive-order',
  imports: [GenericTable, TableColumn, RouterLink, SelectFilter],
  templateUrl: './receive-order.html',
  styleUrl: './receive-order.scss'
})
export class ReceiveOrder implements OnInit {
  isLoading: boolean = false;
  listPurchasing: IPurchasing[] = [];
  pagination: IPaginationInput = {
    page: 1,
    total: 100,
    size: 10,
    totalPages: 1
  };

  filterSelect: ISelectFilter = {
    title: 'Filter status',
    selectOptions: [
      {
        label: PurchasingEn.PROCESS,
        value: PurchasingEn.PROCESS
      },
      {
        label: PurchasingEn.RECEIVE,
        value: PurchasingEn.RECEIVE
      },
      {
        label: PurchasingEn.COMPLETE,
        value: PurchasingEn.COMPLETE
      },
    ]
  }

  paymentStatusFilter: ISelectFilter = {
    title: 'Filter payment status',
    selectOptions: [
      {
        label: PaymentStatusEn.UNPAID,
        value: PaymentStatusEn.UNPAID
      },
      {
        label: PaymentStatusEn.PARTIAL,
        value: PaymentStatusEn.PARTIAL
      },
      {
        label: PaymentStatusEn.PAID,
        value: PaymentStatusEn.PAID
      },
    ]
  }

  columns: Array<ColumnProps> = [
    {
      label: 'Supplier Name',
      id: 'supplier_name',
      extraHeaderClass: 'uppercase-text',
      sort: true
    },
    {
      label: 'Status',
      id: 'status',
      extraHeaderClass: 'uppercase-text',
      sort: true
    },
    {
      label: 'Payment Status',
      id: 'payment_status',
      extraHeaderClass: 'uppercase-text',
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
      label: 'Due Date',
      id: 'due_date',
      extraHeaderClass: 'uppercase-text',
      dataType: 'DATE',
      sort: true
    },
    {
      label: 'Completed Date',
      id: 'completed_date',
      extraHeaderClass: 'uppercase-text',
      dataType: 'DATE',
      sort: true
    },
    {
      label: 'Total Price',
      id: 'total_purchase_price',
      extraHeaderClass: 'uppercase-text',
      dataType: 'CURRENCY'
    },
    {
      label: 'Total Payment',
      id: 'payment_realization',
      extraHeaderClass: 'uppercase-text',
      dataType: 'CURRENCY'
    },
    {
      label: 'Action',
      id: 'action',
      extraHeaderClass: 'uppercase-text w-100 d-flex justify-content-end',
      customElementId: 'action',
    }
  ]
  defaultQuery = {
    page: this.pagination.page,
    size: this.pagination.size,
    search: '',
  }

  lastQuery: ITableQueryData = this.defaultQuery;

  constructor(private service: PurchaseOrderService) { }

  modalOptions: NgbModalOptions = {
    size: 'xl'
  }

  getList(evt: ITableQueryData) {
    this.lastQuery = evt;
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
    if (this.paymentStatusFilter.value?.value) {
      qParams.payment_status = this.paymentStatusFilter.value.value;
    }

    this.service.getPurchasingReceives(qParams).subscribe({
      next: (res) => {
        console.log({ res })
        this.listPurchasing = res.list ?? [];
        this.pagination = {
          page: res.meta?.page ?? 0,
          total: res.meta?.total ?? 0,
          size: res.meta?.size ?? 0,
          totalPages: res.meta?.totalPages ?? 0
        }
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  ngOnInit(): void {
    this.getList(this.defaultQuery)
  }

  onPaymentStatusFilterChange(value: any) {
    this.paymentStatusFilter.value = value;
    this.getList({ ...this.lastQuery, page: 1 });
  }

}

