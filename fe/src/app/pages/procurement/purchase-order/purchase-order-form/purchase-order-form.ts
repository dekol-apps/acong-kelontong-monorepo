import { ChangeDetectorRef, Component } from '@angular/core';
import { formType } from '../../../../types/interfaces/common.interface';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { PurchaseOrderForm1 } from '../purchase-order-form1/purchase-order-form1';
import { PurchaseOrderItem } from '../purchase-order-item/purchase-order-item';
import { ActivatedRoute, Router } from '@angular/router';
import { IPurchasing, IPurchasingItem, PaymentStatusEn, PurchasingEn } from '../../../../types/interfaces/procurement.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PurchaseOrderFormPayment } from "../purchase-order-form-payment/purchase-order-form-payment";
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { PurchasingStore } from '../../../../shared/stores/purchasing.store';
import { nativeToNgbDate } from '../../../../shared/components/date-range-filter/date-range-filter';
import { defaultPpnRate } from '../../../../types/constants/common.constants';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-purchase-order-form',
  imports: [NgbNavModule, PurchaseOrderForm1, PurchaseOrderItem, PurchaseOrderFormPayment, TranslateModule],
  templateUrl: './purchase-order-form.html',
  styleUrl: './purchase-order-form.scss',
})
export class PurchaseOrderForm {
  type: formType = 'new';
  purchasingDetail?: IPurchasing;
  purchasingItems: IPurchasingItem[] = [];
  activeStep: number = 1;
  purchase_id?: string;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private alert: AlertService,
    public store: PurchasingStore,
    private purchasingService: PurchaseOrderService,
    private translate: TranslateService
  ) {
    this.store.purchasing$.subscribe(val => {
      this.purchasingDetail = val;
    })
    const step = this.route.snapshot.paramMap.get('step') || undefined;
    this.purchase_id = this.route.snapshot.paramMap.get('po_id') || undefined;
    const type = this.route.snapshot.queryParamMap.get('type') || undefined;
    if (step) {
      this.activeStep = Number(step);
    }
    if (this.purchase_id) {
      this.getDetail(this.purchase_id);
    }
  }

  form: FormGroup = new FormGroup({
    supplier: new FormControl(null, [Validators.required]),
    due_date: new FormControl(null, [Validators.required]),
    invoice_number: new FormControl(null),
    ppn_facture_number: new FormControl(null),
    purchasing_attachments: new FormControl(null),
    notes: new FormControl(null),
    payment_status: new FormControl(PaymentStatusEn.UNPAID),
    ppn_type: new FormControl(null),
    ppn_rate: new FormControl(defaultPpnRate),
    ppn_amount: new FormControl(null),
    shipping_cost: new FormControl(null),
    payment_realization: new FormControl(null),
    paid_total: new FormControl(null),
  });

  allowedFieldsByStatus = {
    [PurchasingEn.EXPIRED]: [''],
    [PurchasingEn.DROP]: [''],
    [PurchasingEn.COMPLETE]: [
      'status',
      'invoice_number',
      'ppn_facture_number',
      'purchasing_attachments',
      'notes',
      'completed_date',
      'payment_status',
      'paid_total'
    ],
    [PurchasingEn.RECEIVE]: [
      'status',
      'invoice_number',
      'purchasing_attachments',
      'ppn_facture_number',
      'notes',
      'completed_date',
      'payment_status',
      'paid_total',
    ],
    [PurchasingEn.PROCESS]: [
      'status',
      'payment_status',
      'invoice_number',
      'ppn_facture_number',
      'purchasing_attachments',
      'payment_realization',
      'notes',
      'ppn_type',
      'ppn_rate',
      'ppn_amount',
      'shipping_cost',
      'paid_total'
    ],
    [PurchasingEn.REJECT]: [
      'supplier',
      'due_date',
      'status',
      'notes',
      'invoice_number',
      'ppn_facture_number',
      'purchasing_attachments',
      'payment_realization',
      'ppn_type',
      'ppn_rate',
      'ppn_amount',
      'shipping_cost',
      'paid_total'
    ],
    [PurchasingEn.APPROVE]: [
      'status',
      'due_date',
      'payment_status',
      'notes',
      'invoice_number',
      'ppn_facture_number',
      'purchasing_attachments',
      'payment_realization',
      'ppn_type',
      'ppn_rate',
      'ppn_amount',
      'shipping_cost',
      'paid_total'
    ],
    [PurchasingEn.REQUEST]: [
      'status',
      'reject_notes',
    ],
    [PurchasingEn.CREATE]: [
      'status',
      'due_date',
      'notes',
      'supplier',
      'invoice_number',
      'ppn_facture_number',
      'purchasing_attachments',
      'payment_realization',
      'ppn_type',
      'ppn_rate',
      'ppn_amount',
      'shipping_cost',
      'paid_total'
    ],
  };

  getDetail(purchase_id: string) {
    this.purchasingService.getPurchasingDetail(purchase_id).subscribe({
      next: (res) => {
        console.log({ getDetail: res })
        const valToPatch = {
          ...res,
          supplier: res.supplier?._id,
          due_date: nativeToNgbDate(res.due_date),
          invoice_number: res.invoice_number,
          ppn_facture_number: res.ppn_facture_number,
          purchasing_attachments: res.purchasing_attachments?.map(it => {
            return { src: it, file: null }
          }),
          payment_status: res.payment_status,
          ppn_amount: res.ppn_amount,
          shipping_cost: res.shipping_cost,
          payment_realization: res.payment_realization,
          paid_total: res.paid_total
        }
        this.form.patchValue(valToPatch)
        console.log({ valToPatch })
        this.store.setPurchasing(res);
        if (res.status !== PurchasingEn.CREATE && res.status !== PurchasingEn.REJECT) {
          this.form.controls.supplier.disable();
          this.form.controls.due_date.disable();
        }
        const allowed = this.allowedFieldsByStatus[res.status!];
        Object.keys(this.form.controls).forEach(element => {
          if (!allowed.includes(element)) this.form.controls[element].disable();
        });
        if (res.status !== PurchasingEn.DROP && res.status !== PurchasingEn.EXPIRED) {
          this.form.controls.invoice_number.addValidators([Validators.required]);
          this.form.controls.invoice_number.updateValueAndValidity();
          this.form.controls.payment_realization.addValidators([Validators.min(0)]);
          this.form.controls.payment_realization.updateValueAndValidity();
          this.cdr.detectChanges();
        }
      }
    });
  }

  submitForm1(val) {
    if (!this.purchase_id && val && val._id) {
      this.purchase_id = val._id;
      this.store.setPurchasing(val);
      this.nextStep()
    } else {
      this.nextStep()
    }
  }

  submitFormPayment(val) {
    this.router.navigate([`purchase-order/detail/${this.purchase_id}`]);
  }

  submitPurchasing(subject: PurchasingEn) {
    let subscriber = this.purchasingService.requestPO(this.purchase_id!);
    if (subject === PurchasingEn.REQUEST) {
      subscriber = this.purchasingService.requestPO(this.purchase_id!);
    }
    subscriber.subscribe({
      next: (res) => {
        this.alert.success(this.translate.instant('Success, PO waiting for approval'));
        this.done();
      }
    })
  }

  nextStep() {
    if (this.activeStep < 3)
      this.activeStep += 1;
    if (this.purchase_id) {
      this.router.navigate([`purchase-order/form/${this.activeStep}/${this.purchase_id}`], { queryParams: { type: 'edit' } });
    }
  }

  prevStep() {
    if (this.activeStep > 1)
      this.activeStep -= 1;
    if (this.purchase_id) {
      this.router.navigate([`purchase-order/form/${this.activeStep}/${this.purchase_id}`], { queryParams: { type: 'edit' } });
    }
  }

  done() {
    this.router.navigateByUrl('purchase-order');
  }
}
