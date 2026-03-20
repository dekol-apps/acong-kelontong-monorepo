import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { formType, IPaginationInput } from '../../../types/interfaces/common.interface';
import { CURRENCY_FORMAT, DATE_FORMAT, SORT_DIR } from '../../../types/constants/common.constants';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { IPurchasing, IPurchasingItem, PurchasingEn } from '../../../types/interfaces/procurement.interface';
import { PurchaseOrderService } from '../purchase-order/purchase-order.service';
import { PurchaseOrderItemForm } from '../purchase-order/purchase-order-item/purchase-order-item-form/purchase-order-item-form';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purchasing-detail',
  imports: [GenericTable, TableColumn, CommonModule, PurchaseOrderItemForm],
  templateUrl: './purchasing-detail.html',
  styleUrl: './purchasing-detail.scss'
})
export class PurchasingDetail implements OnChanges {
  @ViewChild('POItemForm') poItemForm?: PurchaseOrderItemForm;

  DATE_FORMAT = DATE_FORMAT;
  CURRENCY_FORMAT = CURRENCY_FORMAT;
  @Input() purchase_id?: string;
  purchase_item_id?: string;
  isLoading: boolean = false;
  listPurchasingItem: IPurchasingItem[] = [];
  purchase?: IPurchasing;
  PurchasingEn = PurchasingEn;

  @Output() onQueryDetail: EventEmitter<IPurchasing> = new EventEmitter<IPurchasing>();

  pagination: IPaginationInput = {
    page: 1,
    total: 100,
    size: 10,
    totalPages: 1
  };
  columns: Array<ColumnProps> = [
    {
      label: 'Product',
      id: 'product_name',
      extraHeaderClass: 'uppercase-text',
      backendPropName: 'product_name',
      sort: true,
    },
    {
      label: 'Purchase QTY',
      id: 'purchase_qty',
      extraHeaderClass: 'uppercase-text',
      backendPropName: 'purchase_qty',
    },
    {
      label: 'Purchase Price',
      id: 'purchase_price',
      extraHeaderClass: 'uppercase-text',
      backendPropName: 'purchase_price',
      dataType: 'CURRENCY'
    },
    {
      label: 'Total',
      id: 'price_total',
      extraHeaderClass: 'uppercase-text',
      backendPropName: 'price_total',
      dataType: 'CURRENCY'
    },
    {
      label: 'Action',
      id: 'action',
      extraHeaderClass: 'uppercase-text w-100 d-flex justify-content-end',
      customElementId: 'action',
    }
  ]

  defaultTableParam = {
    page: this.pagination.page,
    size: this.pagination.size,
    sortBy: '',
    sortDir: SORT_DIR.ASC,
    search: '',
  }

  activeModal = Inject(NgbActiveModal);

  constructor(private service: PurchaseOrderService, private modalService: NgbModal) { }

  modalOptions: NgbModalOptions = {
    size: 'xl'
  }

  modalRef
  showForm(id?: string) {
    this.modalRef = this.modalService.open(this.poItemForm, this.modalOptions);
    this.purchase_id = this.purchase_id;
    this.purchase_item_id = id;
  }

  getDetail(purchase_id: string) {
    this.service.getPurchasingDetail(purchase_id).subscribe((res) => {
      console.log({ getDetail: res })
      this.purchase = res;
      this.onQueryDetail.emit(res);
    });
  }

  getList(purchase_id: string, evt: ITableQueryData) {
    this.isLoading = true;
    this.service.getPurchasingItems(purchase_id, {
      page: evt.page,
      size: evt.size,
      sortBy: evt.sortBy,
      sortDir: evt.sortDir,
      search: evt.search,
    }).subscribe({
      next: (res) => {
        this.listPurchasingItem = res.list ?? [];
        this.pagination = {
          page: res.meta?.page ?? 0,
          total: res.meta?.total ?? 0,
          size: res.meta?.size ?? 0,
          totalPages: res.meta?.totalPages ?? 0
        }
        console.log({ listPurchasingItem: this.listPurchasingItem })
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['purchase_id']) {
      if (this.purchase_id) {
        this.getDetail(this.purchase_id);
        this.getList(this.purchase_id, this.defaultTableParam);
      }
    }
  }

  tableRefresh(params) {
    if (this.purchase_id) {
      this.getDetail(this.purchase_id);
      this.getList(this.purchase_id, params);
    }
  }
}
