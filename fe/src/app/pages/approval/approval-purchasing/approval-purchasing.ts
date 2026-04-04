import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenericTable, ColumnProps, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { ConfirmModal } from '../../../shared/components/modals/confirm-modal/confirm-modal';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { IPaginationInput, ISelectFilter } from '../../../types/interfaces/common.interface';
import { IPurchasing, PurchasingEn } from '../../../types/interfaces/procurement.interface';
import { PurchaseOrderService } from '../../procurement/services/purchase-order.service';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RupiahPipe } from '../../../shared/pipes/rupiah.pipe';

@Component({
  selector: 'app-approval-purchasing',
  imports: [CommonModule, GenericTable, TableColumn, RouterLink, ConfirmModal, FormsModule, RupiahPipe],
  standalone: true,
  templateUrl: './approval-purchasing.html',
  styleUrl: './approval-purchasing.scss'
})
export class ApprovalPurchasing implements OnInit {

  @ViewChild('RejectModal') confirmReject?: ConfirmModal;
  isLoading: boolean = false;
  listPurchasing: IPurchasing[] = [];
  pagination: IPaginationInput = {
    page: 1,
    total: 100,
    size: 10,
    totalPages: 1
  };

  PurchasingEn = PurchasingEn;

  filterSelect: ISelectFilter = {
    title: 'Filter status',
    value: { label: PurchasingEn.REQUEST, value: PurchasingEn.REQUEST },
    selectOptions: [
      { label: PurchasingEn.REQUEST, value: PurchasingEn.REQUEST },
      { label: PurchasingEn.APPROVE, value: PurchasingEn.APPROVE },
      { label: PurchasingEn.REJECT, value: PurchasingEn.REJECT },
    ]
  };

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
      label: 'Total Price',
      id: 'total_purchase_price',
      extraHeaderClass: 'uppercase-text',
      customElementId: 'total_purchase_price',
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
    filterSelectVal: this.filterSelect.selectOptions[0],
  }

  rejectNotes: string = '';
  activePurchasingId: string = '';

  constructor(private service: PurchaseOrderService, private alert: AlertService) { }

  modalOptions: NgbModalOptions = {
    size: 'xl'
  }

  getList(evt: ITableQueryData) {
    this.isLoading = true;
    const qParams: any = {
      page: evt.page,
      size: evt.size,
      sortBy: evt.sortBy,
      sortDir: evt.sortDir,
      search: evt.search,
      status: evt.filterSelectVal?.value,
    };
    this.service.getPurchasings(qParams).subscribe({
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

  approvePurchasing(purchasing_id: string) {
    this.service.approvePO(purchasing_id).subscribe(() => {
      this.alert.success('Purchasing approved successfully');
      this.getList(this.defaultQuery);
    });
  }

  rejectPurchasing(purchasing_id: string) {
    this.activePurchasingId = purchasing_id;
    this.rejectNotes = '';
    this.confirmReject?.show().then((res: any) => {
      if (!res) return;
      this.service.rejectPO(this.activePurchasingId, this.rejectNotes).subscribe(() => {
        this.alert.success('Purchasing rejected successfully');
        this.getList(this.defaultQuery);
      });
    });
  }
}
