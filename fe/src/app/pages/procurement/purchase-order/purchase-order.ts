import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { IPaginationInput, ISelectFilter } from '../../../types/interfaces/common.interface';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { ConfirmModal } from '../../../shared/components/modals/confirm-modal/confirm-modal';
import { IPurchasing } from '../../../types/interfaces/procurement.interface';
import { PurchaseOrderService } from './purchase-order.service';

@Component({
  selector: 'app-purchase-order',
  imports: [GenericTable, TableColumn, RouterLink, ConfirmModal],
  templateUrl: './purchase-order.html',
  styleUrl: './purchase-order.scss'
})
export class PurchaseOrder implements OnInit {
  @ViewChild('DeleteModal') confrimDelete?: ConfirmModal;
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
        label: 'Requested',
        value: 'REQUEST'
      },
      {
        label: 'On Process',
        value: 'PROCESS'
      },
      {
        label: 'Received',
        value: 'RECEIVE'
      },
      {
        label: 'Dropped',
        value: 'DROP'
      },
    ]
  }

  // supplier: ISupplier;
  // supplier_name: string;
  // status?: PurchasingEn;
  // received_at?: Date;
  // invoice_number?: string;
  // invoice_photo?: string;
  // total_purchase_price: number;
  // items?: IPurchasingItem[];
  columns: Array<ColumnProps> = [
    {
      label: 'Supplier Name',
      id: 'supplier_name',
      extraHeaderClass: 'uppercase-text',
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
      label: 'Status',
      id: 'status',
      extraHeaderClass: 'uppercase-text',
      sort: true
    },
    {
      label: 'Total Purchase Price',
      id: 'total_purchase_price',
      extraHeaderClass: 'uppercase-text',
      dataType: 'CURRENCY'
    },
    {
      label: 'Payment Realization',
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

  constructor(private service: PurchaseOrderService) { }

  modalOptions: NgbModalOptions = {
    size: 'xl'
  }

  getList(evt: ITableQueryData) {
    this.isLoading = true;
    this.service.getPurchasings({
      page: evt.page,
      size: evt.size,
      sortBy: evt.sortBy,
      sortDir: evt.sortDir,
      search: evt.search,
    }).subscribe({
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

  deletePurchasing(purchasing_id: string) {
    this.confrimDelete?.show().then((res: any) => {
      if (res) {
        this.execDeleteion(purchasing_id);
      }
    })
  }

  execDeleteion(purchasing_id: string) {
    this.service.dropPurchasing(purchasing_id).subscribe(() => {
      this.getList(this.defaultQuery);
    });
  }
}
