import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PurchasingDetail } from '../../purchasing-detail/purchasing-detail';
import { ActivatedRoute, Router } from '@angular/router';
import { formType } from '../../../../types/interfaces/common.interface';
import { IPurchasing, PurchasingEn } from '../../../../types/interfaces/procurement.interface';
@Component({
  selector: 'app-purchase-order-detail',
  imports: [PurchasingDetail],
  templateUrl: './purchase-order-detail.html',
  styleUrl: './purchase-order-detail.scss'
})
export class PurchaseOrderDetail {
  @Output() nextStep: EventEmitter<PurchasingEn> = new EventEmitter<PurchasingEn>()
  @Output() back: EventEmitter<unknown> = new EventEmitter<unknown>()
  @Input() type: formType = 'view';

  purchase_id?: string;
  detail?: IPurchasing;
  PurchasingEn = PurchasingEn;
  constructor(private route: ActivatedRoute, private router: Router) {
    this.purchase_id = this.route.snapshot.paramMap.get('po_id') || undefined;
  }

  exit() {
    this.router.navigateByUrl('purchase-order');
  }

  clickBack() {
    this.back.emit()
  }

  clickSubmit() {
    if (this.detail?.status === PurchasingEn.CREATE) this.nextStep.emit(PurchasingEn.REQUEST);
  }
}
