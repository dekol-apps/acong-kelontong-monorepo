import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidation } from '../../../../shared/directives/form-validation/form-validation';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { IPurchasing, ISupplier } from '../../../../types/interfaces/procurement.interface';
import { SupplierService } from '../../supplier/supplier.service';
import { PurchaseOrderService } from '../purchase-order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDate, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { nativeToNgbDate, ngbToNativeDate } from '../../../../shared/components/date-range-filter/date-range-filter';
import { formType } from '../../../../types/interfaces/common.interface';

@Component({
  selector: 'app-purchase-order-form1',
  imports: [ReactiveFormsModule, FormValidation, NgbDatepickerModule],
  templateUrl: './purchase-order-form1.html',
  styleUrl: './purchase-order-form1.scss'
})
export class PurchaseOrderForm1 implements OnInit {
  @Input() suppliers: ISupplier[] = [];
  purchase_id?: string;
  purchasingDetail?: IPurchasing;
  @Output() submitPO: EventEmitter<unknown> = new EventEmitter<unknown>()
  @Output() back: EventEmitter<unknown> = new EventEmitter<unknown>()
  @Input() type: formType = 'view';
  patchFileVal?: string;

  @Input() form: FormGroup = new FormGroup({
    supplier: new FormControl(null, [Validators.required]),
    due_date: new FormControl(null, [Validators.required]),
  });

  constructor(private alert: AlertService, private supplierSvc: SupplierService, private purchasingService: PurchaseOrderService, private router: Router, private route: ActivatedRoute) {
    this.purchase_id = this.route.snapshot.paramMap.get('po_id') || undefined;
    if (this.purchase_id) {
      this.getDetail(this.purchase_id);
    }
  }

  ngOnInit(): void {
    this.getRoles();
  }

  getDetail(purchase_id: string) {
    this.purchasingService.getPurchasingDetail(purchase_id).subscribe({
      next: (res) => {
        console.log({ getDetail: res })
        this.purchasingDetail = res;
        const valToPatch = {
          supplier: res.supplier?._id,
          due_date: nativeToNgbDate(res.due_date),
        }
        this.form.patchValue(valToPatch)
        console.log({ valToPatch })
      }
    });
  }

  onDateSelection(date: NgbDate | null) {
    this.form.controls.due_date.patchValue(date)
  }
  changeDate() {
    const date = this.form.value.due_date;
    console.log({ due_date: date })
  }

  getRoles() {
    this.supplierSvc.getSuppliers({ page: 0, size: 1000 }).subscribe((res) => {
      this.suppliers = res.list ?? [];
    })
  }

  next() {
    if (this.form.invalid) return this.alert.error('Please check your inputs');
    const body = {
      ...this.form.value,
      due_date: ngbToNativeDate(this.form.value.due_date)
    };
    console.log({ body })
    this.submitPO.emit(body)
  }
}
