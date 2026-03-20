import { Component } from '@angular/core';
import { formType } from '../../../../types/interfaces/common.interface';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { PurchaseOrderForm1 } from '../purchase-order-form1/purchase-order-form1';
import { PurchaseOrderItem } from '../purchase-order-item/purchase-order-item';
import { PurchaseOrderDetail } from '../purchase-order-detail/purchase-order-detail';
import { ActivatedRoute, Router } from '@angular/router';
import { IPurchasing, IPurchasingItem, PurchasingEn } from '../../../../types/interfaces/procurement.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PurchaseOrderFormPayment } from "../purchase-order-form-payment/purchase-order-form-payment";
import { PurchaseOrderService } from '../purchase-order.service';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { PurchasingStore } from '../../../../shared/stores/purchasing.store';
import { nativeToNgbDate } from '../../../../shared/components/date-range-filter/date-range-filter';

@Component({
  selector: 'app-purchase-order-form',
  imports: [NgbNavModule, PurchaseOrderForm1, PurchaseOrderItem, PurchaseOrderDetail, PurchaseOrderFormPayment],
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
    private route: ActivatedRoute,
    private router: Router,
    private alert: AlertService,
    public store: PurchasingStore,
    private purchasingService: PurchaseOrderService
  ) {
    this.store.purchasing$.subscribe(val => {
      this.purchasingDetail = val;
    })
    const step = this.route.snapshot.paramMap.get('step') || undefined;
    this.purchase_id = this.route.snapshot.paramMap.get('po_id') || undefined;
    const type = this.route.snapshot.queryParamMap.get('type') || undefined;
    if (type && ['view', 'new', 'edit'].includes(type)) {
      this.type = type as formType;
      if (this.type === 'view') {
        this.activeStep = 4;
      } else if (step) {
        this.activeStep = Number(step);
      }
    } else if (step) {
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
    pph_type: new FormControl(null),
    ppn_type: new FormControl(null),
    pph_rate: new FormControl(null),
    ppn_rate: new FormControl(null),
    pph_amount: new FormControl(null),
    ppn_amount: new FormControl(null),
    shipping_cost: new FormControl(null),
    payment_realization: new FormControl(null),
  });

  allowedFieldsByStatus = {
    [PurchasingEn.EXPIRED]: [''],
    [PurchasingEn.DROP]: [''],
    [PurchasingEn.COMPLETE]: [''],
    [PurchasingEn.RECEIVE]: [
      'status',
      'notes',
      'completed_date',
      'invoice_number',
      'ppn_facture_number',
      'purchasing_attachments',
    ],
    [PurchasingEn.PROCESS]: [
      'status',
      'invoice_number',
      'ppn_facture_number',
      'purchasing_attachments',
      'payment_realization',
      'notes',
      'pph_type',
      'ppn_type',
      'pph_rate',
      'ppn_rate',
      'pph_amount',
      'ppn_amount',
      'shipping_cost'
    ],
    [PurchasingEn.REJECT]: [
      'status',
      'due_date',
      'notes',
      'supplier_name',
      'supplier',
    ],
    [PurchasingEn.APPROVE]: [
      'status',
      'due_date',
      'notes',
    ],
    [PurchasingEn.REQUEST]: [
      'status',
      'reject_notes'
    ],
    [PurchasingEn.CREATE]: [
      'status',
      'due_date',
      'notes',
      'supplier_name',
      'supplier',
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
          ppn_amount: res.ppn_amount,
          shipping_cost: res.shipping_cost,
          payment_realization: res.payment_realization
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
    this.nextStep()
  }

  submitPurchasing(subject: PurchasingEn) {
    let subscriber = this.purchasingService.requestPO(this.purchase_id!);
    if (subject === PurchasingEn.REQUEST) {
      subscriber = this.purchasingService.requestPO(this.purchase_id!);
    }
    subscriber.subscribe({
      next: (res) => {
        this.alert.success('Success, PO waiting for approval');
        this.done();
      }
    })
  }

  nextStep() {
    if (this.activeStep < 4)
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
