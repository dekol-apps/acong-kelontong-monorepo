import { Component } from '@angular/core';
import { formType } from '../../../../types/interfaces/common.interface';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { PurchaseOrderForm1 } from '../purchase-order-form1/purchase-order-form1';
import { PurchaseOrderItem } from '../purchase-order-item/purchase-order-item';
import { PurchaseOrderDetail } from '../purchase-order-detail/purchase-order-detail';
import { ActivatedRoute, Router } from '@angular/router';
import { IPurchasing, IPurchasingItem } from '../../../../types/interfaces/procurement.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PurchaseOrderFormPayment } from "../purchase-order-form-payment/purchase-order-form-payment";
import { PurchaseOrderService } from '../purchase-order.service';
import { AlertService } from '../../../../shared/components/alert/alert-service';

@Component({
  selector: 'app-purchase-order-form',
  imports: [NgbNavModule, PurchaseOrderForm1, PurchaseOrderItem, PurchaseOrderDetail, PurchaseOrderFormPayment],
  templateUrl: './purchase-order-form.html',
  styleUrl: './purchase-order-form.scss'
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
    private purchasingService: PurchaseOrderService
  ) {
    const step = this.route.snapshot.paramMap.get('step') || undefined;
    this.purchase_id = this.route.snapshot.paramMap.get('po_id') || undefined;
    const type = this.route.snapshot.queryParamMap.get('type') || undefined;
    if (type && ['view', 'new', 'edit'].includes(type)) {
      this.type = type as formType;
      if (this.type === 'view') {
        this.activeStep = 3;
      } else if (step) {
        this.activeStep = Number(step);
      }
    } else if (step) {
      this.activeStep = Number(step);
    }
  }

  form: FormGroup = new FormGroup({
    supplier: new FormControl(null, [Validators.required]),
    due_date: new FormControl(null, [Validators.required]),
    invoice_number: new FormControl(null),
    purchasing_attachments: new FormControl(null),
    notes: new FormControl(null),
    pph_type: new FormControl(null),
    ppn_type: new FormControl(null),
    pph_rate: new FormControl(null),
    ppn_rate: new FormControl(null),
    pph_amount: new FormControl(null),
    ppn_amount: new FormControl(null),
    shipping_cost: new FormControl(null),
  });

  submitForm1(val) {
    let serviceArg = this.purchasingService.createPurchasing(val);
    if (this.purchase_id) serviceArg = this.purchasingService.editPurchasing(this.purchase_id, val)
    serviceArg.subscribe({
      next: (res) => {
        this.alert.success(`Success ${this.purchase_id ? 'edit' : 'create'} purchasing!`);
        if (!this.purchase_id) {
          this.purchase_id = res._id;
          this.router.navigate([`../2/${this.purchase_id}`], { relativeTo: this.route, queryParams: { type: 'edit' } });
        } else {
          this.nextStep()
        }
      }
    })
  }

  nextStep() {
    console.log('nextStep')
    if (this.activeStep < 3)
      this.activeStep += 1;
  }

  prevStep() {
    if (this.activeStep > 1)
      this.activeStep -= 1;
  }

  done() {
    this.router.navigateByUrl('purchase-order');
  }
}
