import { Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { IPurchasingItem } from '../../../../types/interfaces/procurement.interface';
import { PurchaseOrderService } from '../purchase-order.service';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../../shared/components/generic-table/generic-table';
import { ConfirmModal } from '../../../../shared/components/modals/confirm-modal/confirm-modal';
import { TableColumn } from '../../../../shared/directives/table-column/table-column';
import { SORT_DIR } from '../../../../types/constants/common.constants';
import { IPaginationInput, formType } from '../../../../types/interfaces/common.interface';
import { PurchaseOrderItemForm } from './purchase-order-item-form/purchase-order-item-form';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-purchase-order-item',
  imports: [GenericTable, TableColumn, ConfirmModal, PurchaseOrderItemForm],
  templateUrl: './purchase-order-item.html',
  styleUrl: './purchase-order-item.scss'
})
export class PurchaseOrderItem implements OnInit {

  @Output() nextStep: EventEmitter<unknown> = new EventEmitter<unknown>()
  @Output() back: EventEmitter<unknown> = new EventEmitter<unknown>()

  @ViewChild('ConfirmModal') confrimModal?: ConfirmModal;
  @ViewChild('POItemForm', { static: false }) poItemForm?: TemplateRef<PurchaseOrderItemForm>;

  @Input() type: formType = 'view';

  isLoading: boolean = false;
  listPurchasingItem: IPurchasingItem[] = [];
  purchase_id?: string;
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

  constructor(private service: PurchaseOrderService, private modalService: NgbModal, private alert: AlertService, private route: ActivatedRoute) {
    this.purchase_id = this.route.snapshot.paramMap.get('po_id') || undefined;
  }

  modalOptions: NgbModalOptions = {
    size: 'xl'
  }

  modalRef
  showForm(type: formType, id?: string) {
    this.modalRef = this.modalService.open(this.poItemForm, this.modalOptions);
    this.form_type = type;
    this.purchase_id = this.purchase_id;
    this.purchase_item_id = id;
  }

  close(save: boolean) {
    console.log('save', save)
    if (save) this.getList(this.defaultTableParam);
    this.modalRef.dismiss();
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


