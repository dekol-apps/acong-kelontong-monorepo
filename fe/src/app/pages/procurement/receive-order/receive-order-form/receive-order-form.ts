import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { GenericTable, ColumnProps, ITableQueryData } from '../../../../shared/components/generic-table/generic-table';
import { AutoWildcard } from '../../../../shared/directives/auto-wildcard/auto-wildcard';
import { FormValidation } from '../../../../shared/directives/form-validation/form-validation';
import { TableColumn } from '../../../../shared/directives/table-column/table-column';
import { SORT_DIR } from '../../../../types/constants/common.constants';
import { IPaginationInput } from '../../../../types/interfaces/common.interface';
import { IPurchasing, IPurchasingItem } from '../../../../types/interfaces/procurement.interface';
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'app-receive-order-form',
  imports: [CommonModule, ReactiveFormsModule, GenericTable, TableColumn, FormValidation, AutoWildcard],
  standalone: true,
  templateUrl: './receive-order-form.html',
  styleUrl: './receive-order-form.scss',
})
export class ReceiveOrderForm implements OnInit {
  purchasingId: string = '';
  purchasingDetail?: IPurchasing;
  listPurchasingItem: IPurchasingItem[] = [];
  form: FormGroup;
  isLoading: boolean = false;

  // State persistence across pages
  receivedMap: { [itemId: string]: number } = {};

  pagination: IPaginationInput = {
    page: 1,
    total: 0,
    size: 10,
    totalPages: 1
  };

  defaultTableParam = {
    page: this.pagination.page,
    size: this.pagination.size,
    sortBy: '',
    sortDir: SORT_DIR.ASC,
    search: '',
  }

  columns: Array<ColumnProps> = [
    {
      label: 'Product',
      id: 'product_name',
      extraHeaderClass: 'uppercase-text',
    },
    {
      label: 'Purchase Qty',
      id: 'purchase_qty',
      extraHeaderClass: 'uppercase-text',
    },
    {
      label: 'Received So Far',
      id: 'received_qty', // This is what's already received on the item
      extraHeaderClass: 'uppercase-text',
    },
    {
      label: 'Received Now',
      id: 'received_now',
      customElementId: 'received_qty',
      extraHeaderClass: 'uppercase-text',
    },
    {
      label: 'Remaining',
      id: 'remaining',
      customElementId: 'remaining',
      extraHeaderClass: 'uppercase-text',
    },
    {
      label: 'Action',
      id: 'action',
      customElementId: 'action',
      extraHeaderClass: 'w-100 d-flex justify-content-end',
    }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private poService: PurchaseOrderService,
    private alert: AlertService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      invoice_number: [null]
    });
  }

  ngOnInit(): void {
    this.purchasingId = this.route.snapshot.paramMap.get('po_id') || '';
    if (this.purchasingId) {
      this.getDetail();
      this.getList(this.defaultTableParam);
    } else {
      this.alert.error('Purchase ID not found');
      this.router.navigate(['/purchase-order']);
    }
  }

  getDetail() {
    this.poService.getPurchasingDetail(this.purchasingId).subscribe({
      next: (res) => {
        this.purchasingDetail = res;
        this.form.patchValue({ invoice_number: res.invoice_number });
      },
      error: () => this.alert.error('Failed to fetch PO detail')
    });
  }

  getList(evt: ITableQueryData) {
    this.isLoading = true;
    this.poService.getPurchasingItems(
      this.purchasingId,
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
          console.log('pagination', this.pagination)
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.alert.error('Failed to fetch PO items');
        }
      });
  }

  onQtyChange(item: IPurchasingItem, qty: number | string) {
    const qtyNum = Number(qty);
    const itemId = item._id!;

    if (qtyNum <= 0) {
      delete this.receivedMap[itemId];
    } else {
      const alreadyReceived = item.received_qty || 0;
      const purchaseQty = item.purchase_qty || 0;
      const maxAllowed = purchaseQty - alreadyReceived;

      if (qtyNum > maxAllowed) {
        this.alert.error(`Max allowed for "${item.product?.product_name || item.product_name}" is ${maxAllowed}`);
        this.receivedMap[itemId] = maxAllowed;
      } else {
        this.receivedMap[itemId] = qtyNum;
      }
    }
    this.cdr.detectChanges();
  }

  getRemaining(item: IPurchasingItem): number {
    const receivingNow = this.receivedMap[item._id!] || 0;
    const totalReceived = (item.received_qty || 0) + receivingNow;
    const result = (item.purchase_qty || 0) - totalReceived;
    return result;
  }

  clearItem(itemId: string) {
    delete this.receivedMap[itemId];
    this.cdr.detectChanges();
  }

  submit() {
    const receivedItems = Object.keys(this.receivedMap)
      .filter(id => this.receivedMap[id] > 0)
      .map(id => ({
        _id: id,
        received_qty: this.receivedMap[id]
      }));

    if (receivedItems.length === 0) {
      return this.alert.error('Please input at least one received quantity');
    }

    const payload = {
      invoice_number: this.form.value.invoice_number,
      receivedItems
    };

    this.isLoading = true;
    this.poService.receiveOrder(this.purchasingId, payload).subscribe({
      next: () => {
        this.alert.success('Purchase Order received successfully');
        this.router.navigate(['/purchase-order/detail', this.purchasingId]);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.option?.message || 'Failed to receive PO';
        this.alert.error(msg);
      }
    });
  }

  back() {
    this.router.navigate(['/purchase-order/detail', this.purchasingId]);
  }
}
