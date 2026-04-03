import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidation } from '../../../../shared/directives/form-validation/form-validation';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { IFielImg } from '../../../../shared/components/drag-drop-file/drag-drop-file.component';
import { IPurchasing, PaymentStatusEn, PurchasingEn } from '../../../../types/interfaces/procurement.interface';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
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
  ppnTypes = PPNTYPES;
  paymentStatuses = [
    { label: PaymentStatusEn.UNPAID, value: PaymentStatusEn.UNPAID },
    { label: PaymentStatusEn.PARTIAL, value: PaymentStatusEn.PARTIAL },
    { label: PaymentStatusEn.PAID, value: PaymentStatusEn.PAID },
  ];
  purchasingDetail?: IPurchasing;
  @Output() next: EventEmitter<unknown> = new EventEmitter<unknown>();
  @Output() back: EventEmitter<unknown> = new EventEmitter<unknown>();
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
      this.syncPaymentRules();
    })
  }

  ngOnInit(): void {
    this.syncPaymentRules();
    this.form?.controls.payment_status?.valueChanges.subscribe(() => {
      this.syncPaymentRules();
    });
  }

  get isPaymentLocked(): boolean {
    return this.purchasingDetail?.payment_status !== undefined && this.purchasingDetail.payment_status !== PaymentStatusEn.UNPAID;
  }

  private syncPaymentRules() {
    if (!this.form) return;

    const paymentStatusControl = this.form.get('payment_status');
    const paymentDataControls = [
      'ppn_type',
      'ppn_rate',
      'ppn_amount',
      'shipping_cost',
      'payment_realization',
      'notes',
    ];

    if (this.isPaymentLocked) {
      paymentStatusControl?.setValue(PaymentStatusEn.PAID, { emitEvent: false });
      paymentStatusControl?.disable({ emitEvent: false });
      paymentDataControls.forEach((controlName) => {
        this.form?.get(controlName)?.disable({ emitEvent: false });
      });
    }

    const selectedStatus = paymentStatusControl?.value as PaymentStatusEn | undefined;
    const requirePaymentData = !this.isPaymentLocked && selectedStatus !== undefined && selectedStatus !== PaymentStatusEn.UNPAID;

    ['ppn_type', 'ppn_rate', 'ppn_amount', 'shipping_cost', 'payment_realization'].forEach((controlName) => {
      const control = this.form?.get(controlName);
      if (!control) return;

      if (requirePaymentData) {
        control.setValidators([Validators.required]);
      } else {
        control.clearValidators();
      }

      control.updateValueAndValidity({ emitEvent: false });
    });

    if (paymentStatusControl) {
      if (this.isPaymentLocked) {
        paymentStatusControl.clearValidators();
      } else {
        paymentStatusControl.setValidators([Validators.required]);
      }
      paymentStatusControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  submit() {
    const value = this.form?.getRawValue();
    if (!this.form || this.form.invalid) return this.alert.error('Please check your inputs');

    const paymentStatus = this.isPaymentLocked
      ? PaymentStatusEn.PAID
      : (value.payment_status ?? PaymentStatusEn.UNPAID);

    const body: Record<string, unknown> = {
      invoice_number: value.invoice_number,
      ppn_facture_number: value.ppn_facture_number,
      purchasing_attachments: value.purchasing_attachments?.map((it: IFielImg) => it.file ?? it.src),
      paid_total: value.paid_total !== undefined && value.paid_total !== null ? toMoneyString(value.paid_total) : undefined,
      payment_status: paymentStatus,
    };

    if (!this.isPaymentLocked) {
      body.ppn_type = value.ppn_type;
      body.ppn_rate = value.ppn_rate;
      body.ppn_amount = value.ppn_amount !== undefined && value.ppn_amount !== null ? toMoneyString(value.ppn_amount) : undefined;
      body.shipping_cost = value.shipping_cost !== undefined && value.shipping_cost !== null ? toMoneyString(value.shipping_cost) : undefined;
      body.payment_realization = value.payment_realization !== undefined && value.payment_realization !== null ? toMoneyString(value.payment_realization) : undefined;
      body.notes = value.notes;
    }

    const formData = objToFormData(body, { fileFields: ['purchasing_attachments'] });
    const subscriber = this.store.payment(formData)
    subscriber.subscribe({
      next: (res) => {
        this.alert.success(`Success ${this.purchase_id ? 'edit' : 'create'} purchasing!`);
        this.next.emit(res)
      },
      error: (err) => {
        if (err.error.error_code == 400) {
          this.invalidPPn = err.error.message ?? err.error?.option?.message ?? 'Unable to submit payment';
        }
      }
    })
  }

  exit() {
    this.router.navigateByUrl('purchase-order');
  }

  addFile(evt: IFielImg[]) {
    if (!evt.length) this.form?.controls.purchasing_attachments.reset();
    else this.form?.controls.purchasing_attachments.patchValue(evt);
  }
}
