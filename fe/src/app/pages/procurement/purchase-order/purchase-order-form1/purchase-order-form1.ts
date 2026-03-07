import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidation } from '../../../../shared/directives/form-validation/form-validation';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { IPurchasing, ISupplier } from '../../../../types/interfaces/procurement.interface';
import { SupplierService } from '../../supplier/supplier.service';
import { NgbDate, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { ngbToNativeDate } from '../../../../shared/components/date-range-filter/date-range-filter';
import { formType } from '../../../../types/interfaces/common.interface';
import { PurchasingStore } from '../../../../shared/stores/purchasing.store';

@Component({
  selector: 'app-purchase-order-form1',
  imports: [ReactiveFormsModule, FormValidation, NgbDatepickerModule],
  templateUrl: './purchase-order-form1.html',
  styleUrl: './purchase-order-form1.scss'
})
export class PurchaseOrderForm1 implements OnInit {
  @Input() suppliers: ISupplier[] = [];
  @Output() next: EventEmitter<IPurchasing> = new EventEmitter<IPurchasing>()
  @Output() back: EventEmitter<unknown> = new EventEmitter<unknown>()
  @Input() type: formType = 'view';
  @Input() purchase_id?: string;
  patchFileVal?: string;

  @Input() form: FormGroup = new FormGroup({
    supplier: new FormControl(null, [Validators.required]),
    due_date: new FormControl(null, [Validators.required]),
  });

  constructor(private alert: AlertService, private supplierSvc: SupplierService, private store: PurchasingStore) { }

  ngOnInit(): void {
    this.getSupplierDropdown();
  }

  onDateSelection(date: NgbDate | null) {
    this.form.controls.due_date.patchValue(date)
  }

  getSupplierDropdown() {
    this.supplierSvc.getSuppliers({ page: 0, size: 1000 }).subscribe((res) => {
      this.suppliers = res.list ?? [];
    })
  }

  submit() {
    if (this.form.invalid) return this.alert.error('Please check your inputs');
    const body = {
      supplier: this.form.getRawValue().supplier,
      due_date: ngbToNativeDate(this.form.getRawValue().due_date)
    };
    let serviceArg = this.store.create(body);
    if (this.purchase_id) serviceArg = this.store.update(body)
    serviceArg.subscribe({
      next: (res) => {
        this.alert.success(`Success ${this.purchase_id ? 'edit' : 'create'} purchasing!`);
        this.next.emit(res)
      }
    })
  }
}
