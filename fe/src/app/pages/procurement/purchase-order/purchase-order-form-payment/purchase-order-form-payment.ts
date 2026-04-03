import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidation } from '../../../../shared/directives/form-validation/form-validation';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { IPurchasing, PurchasingEn } from '../../../../types/interfaces/procurement.interface';
import { IFielImg } from '../../../../shared/components/drag-drop-file/drag-drop-file.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { ngbToNativeDate } from '../../../../shared/components/date-range-filter/date-range-filter';
import { formType } from '../../../../types/interfaces/common.interface';
import { DragDropFileMulti } from '../../../../shared/components/drag-drop-file-multi/drag-drop-file-multi';
import { PPNTYPES } from '../../../../types/constants/common.constants';
import { PurchasingStore } from '../../../../shared/stores/purchasing.store';
import { objToFormData, toMoneyString } from '../../../../utils/helper';
import { AutoWildcard } from '../../../../shared/directives/auto-wildcard/auto-wildcard';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-purchase-order-form-payment',
  imports: [ReactiveFormsModule, FormValidation, DragDropFileMulti, NgbDatepickerModule, AutoWildcard, TranslateModule],
  templateUrl: './purchase-order-form-payment.html',
  styleUrl: './purchase-order-form-payment.scss'
})
export class PurchaseOrderFormPayment implements OnInit {
  ppnTypes = PPNTYPES
  purchasingDetail?: IPurchasing;
  @Output() next: EventEmitter<unknown> = new EventEmitter<unknown>()
  @Output() back: EventEmitter<unknown> = new EventEmitter<unknown>()
  @Input() type: formType = 'view';
  @Input() purchase_id?: string;
  isLoading?: boolean;
  patchFileVal?: string;
  PurchasingEn = PurchasingEn;
  invalidPPn: string = '';
  @Input() form?: FormGroup;

  constructor(private alert: AlertService, private store: PurchasingStore, private router: Router) {
    this.store.purchasing$.subscribe(val => {
      this.purchasingDetail = val;
    })
  }

  ngOnInit(): void {
  }

  submit() {
    const value = this.form?.getRawValue();
    if (this.form?.invalid) return this.alert.error('Please check your inputs');
    const body = {
      ...value,
      ppn_amount: value.ppn_amount !== undefined && value.ppn_amount !== null ? toMoneyString(value.ppn_amount) : undefined,
      shipping_cost: value.shipping_cost !== undefined && value.shipping_cost !== null ? toMoneyString(value.shipping_cost) : undefined,
      payment_realization: value.payment_realization !== undefined && value.payment_realization !== null ? toMoneyString(value.payment_realization) : undefined,
      supplier: value.supplier,
      due_date: ngbToNativeDate(value.due_date),
      purchasing_attachments: value.purchasing_attachments?.map(it => it.file ?? it.src)
    };
    console.log({ body });
    const formData = objToFormData(body, { fileFields: ['purchasing_attachments'] });
    const subscriber = this.store.payment(formData)
    subscriber.subscribe({
      next: (res) => {
        this.alert.success(`Success ${this.purchase_id ? 'edit' : 'create'} purchasing!`);
        this.next.emit(res)
      },
      error: (err) => {
        if (err.error.error_code == 400) {
          this.invalidPPn = err.error.message;
        }
      }
    })
  }

  exit() {
    this.router.navigateByUrl('purchase-order');
  }

  addFile(evt: IFielImg[]) {
    if (!evt.length) this.form?.controls.attachments.reset();
    else this.form?.controls.attachments.patchValue(evt);
  }
}
