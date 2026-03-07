import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormValidation } from '../../../../shared/directives/form-validation/form-validation';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { IPurchasing } from '../../../../types/interfaces/procurement.interface';
import { IFielImg } from '../../../../shared/components/drag-drop-file/drag-drop-file.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { ngbToNativeDate } from '../../../../shared/components/date-range-filter/date-range-filter';
import { formType } from '../../../../types/interfaces/common.interface';
import { DragDropFileMulti } from '../../../../shared/components/drag-drop-file-multi/drag-drop-file-multi';
import { PPHTYPES, PPNTYPES } from '../../../../types/constants/common.constants';
import { PurchasingStore } from '../../../../shared/stores/purchasing.store';
import { objToFormData } from '../../../../utils/helper';

@Component({
  selector: 'app-purchase-order-form-payment',
  imports: [ReactiveFormsModule, FormValidation, DragDropFileMulti, NgbDatepickerModule],
  templateUrl: './purchase-order-form-payment.html',
  styleUrl: './purchase-order-form-payment.scss'
})
export class PurchaseOrderFormPayment implements OnInit {
  pphTypes = PPHTYPES;
  ppnTypes = PPNTYPES
  purchasingDetail?: IPurchasing;
  @Output() next: EventEmitter<unknown> = new EventEmitter<unknown>()
  @Output() back: EventEmitter<unknown> = new EventEmitter<unknown>()
  @Input() type: formType = 'view';
  @Input() purchase_id?: string;
  isLoading?: boolean;
  patchFileVal?: string;

  @Input() form: FormGroup = new FormGroup({
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
    payment_realization: new FormControl(null),
  });

  constructor(private alert: AlertService, private store: PurchasingStore) { }

  ngOnInit(): void {
  }

  submit() {
    if (this.form.invalid) return this.alert.error('Please check your inputs');
    const value = this.form.getRawValue();
    const body = {
      ...value,
      supplier: value.supplier,
      due_date: ngbToNativeDate(value.due_date),
      purchasing_attachments: value.purchasing_attachments.map(it => it.file ?? it.src)
    };
    const formData = objToFormData(body, { fileFields: ['purchasing_attachments'] });
    this.store.update(formData).subscribe({
      next: (res) => {
        this.alert.success(`Success ${this.purchase_id ? 'edit' : 'create'} purchasing!`);
        this.next.emit(res)
      }
    })
  }

  addFile(evt: IFielImg[]) {
    if (!evt.length) this.form.controls.attachments.reset();
    else this.form.controls.attachments.patchValue(evt);
  }
}
