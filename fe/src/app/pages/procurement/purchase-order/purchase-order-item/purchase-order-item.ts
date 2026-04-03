import { Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { IPurchasing, IPurchasingItem, PurchasingEn } from '../../../../types/interfaces/procurement.interface';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../../shared/components/generic-table/generic-table';
import { ConfirmModal } from '../../../../shared/components/modals/confirm-modal/confirm-modal';
import { TableColumn } from '../../../../shared/directives/table-column/table-column';
import { SORT_DIR } from '../../../../types/constants/common.constants';
import { IPaginationInput, formType } from '../../../../types/interfaces/common.interface';
import { PurchaseOrderItemForm } from './purchase-order-item-form/purchase-order-item-form';
import { ActivatedRoute } from '@angular/router';
import { PurchasingStore } from '../../../../shared/stores/purchasing.store';

@Component({
  selector: 'app-purchase-order-item',
  imports: [GenericTable, TableColumn, ConfirmModal, PurchaseOrderItemForm],
  templateUrl: './purchase-order-item.html',
  styleUrl: './purchase-order-item.scss'
})
export class PurchaseOrderItem implements OnInit {

  @Output() next: EventEmitter<unknown> = new EventEmitter<unknown>()
  @Output() back: EventEmitter<unknown> = new EventEmitter<unknown>()

  @ViewChild('ConfirmModal') confrimModal?: ConfirmModal;
  @ViewChild('POItemForm', { static: false }) poItemForm?: TemplateRef<PurchaseOrderItemForm>;

  @Input() type: formType = 'view';
  @Input() purchase_id?: string;

  isLoading: boolean = false;
  listPurchasingItem: IPurchasingItem[] = [];
  purchase_item_id?: string;
  form_type?: formType;

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
      label: 'SKU',
      id: 'product_sku',
      extraHeaderClass: 'uppercase-text',
      backendPropName: 'product_sku',
      sort: true,
    },
    {
      label: 'Quantity',
      id: 'purchase_qty',
      extraHeaderClass: 'uppercase-text',
      backendPropName: 'purchase_qty',
    },
    {
      label: 'Price',
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

  purchasing?: IPurchasing;

  ableToTouch: string[] = [PurchasingEn.CREATE, PurchasingEn.REJECT, PurchasingEn.REQUEST, PurchasingEn.APPROVE, PurchasingEn.PROCESS] as string[];

  constructor(private service: PurchaseOrderService, private modalService: NgbModal, private alert: AlertService, private store: PurchasingStore) {
    this.store.purchasing$.subscribe(val => {
      this.purchasing = val;
    })
  }

  canTouch() {
    const status = this.purchasing?.status;
    const paymentStatus = this.purchasing?.payment_status;
    if (paymentStatus && paymentStatus !== 'UNPAID') {
      return false;
    }
    return this.type === 'new' || (this.type === 'edit' && status && this.ableToTouch.includes(status))
  }

  modalOptions: NgbModalOptions = {
    size: 'xl'
  }

  modalRef?: NgbModalRef;
  showForm(type: formType, id?: string) {
    this.modalRef = this.modalService.open(this.poItemForm, this.modalOptions);
    this.form_type = type;
    this.purchase_id = this.purchase_id;
    this.purchase_item_id = id;
  }

  close(save: boolean) {
    console.log('save', save)
    if (save) this.getList(this.defaultTableParam);
    this.modalRef?.dismiss();
  }

  getList(evt: ITableQueryData) {
    this.isLoading = true;
    this.service.getPurchasingItems(
      this.purchase_id || '',
      {
        page: evt.page,
        size: evt.size,
        sortBy: evt.sortBy,
        sortDir: evt.sortDir,
        search: evt.search,
      }).subscribe({
        next: (res) => {
          this.listPurchasingItem = res.list ?? [];
          this.pagination = {
            page: res.meta?.page ?? this.defaultTableParam.page,
            total: res.meta?.total ?? 0,
            size: res.meta?.size ?? this.defaultTableParam.size,
            totalPages: res.meta?.totalPages ?? this.defaultTableParam.page
          }
          console.log({ listPurchasingItem: this.listPurchasingItem })
          this.isLoading = false;
        }, error: () => {
          this.isLoading = false;
        }
      });
  }

  ngOnInit(): void {
    this.getList(this.defaultTableParam);
  }

  deletePurchaseItem(purchaseItem: IPurchasingItem) {
    const purchaseItemId = purchaseItem._id;
    const itemName = `${purchaseItem.product_name}`;
    this.confrimModal?.show({ itemName }).then((res: any) => {
      if (res && purchaseItemId) {
        this.execDeleteion(purchaseItemId);
      }
    })
  }

  execDeleteion(purchaseItemId: string) {
    this.service.deletePurchaseItem(purchaseItemId).subscribe(() => {
      this.alert.success('Purchase item deleted')
      this.getList(this.defaultTableParam);
    });
  }
}


