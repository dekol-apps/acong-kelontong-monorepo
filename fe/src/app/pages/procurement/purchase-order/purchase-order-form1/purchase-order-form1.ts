import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidation } from '../../../../shared/directives/form-validation/form-validation';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { IPurchasing, ISupplier } from '../../../../types/interfaces/procurement.interface';
import { DragDropFileComponent, IFielImg } from '../../../../shared/components/drag-drop-file/drag-drop-file.component';
import { SupplierService } from '../../supplier/supplier.service';
import { PurchaseOrderService } from '../purchase-order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDate, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { nativeToNgbDate, ngbToNativeDate } from '../../../../shared/components/date-range-filter/date-range-filter';
import { formType } from '../../../../types/interfaces/common.interface';

@Component({
  selector: 'app-purchase-order-form1',
  imports: [ReactiveFormsModule, FormValidation, DragDropFileComponent, NgbDatepickerModule],
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
  loading?: boolean;
  patchFileVal?: string;

  form: FormGroup = new FormGroup({
    supplier: new FormControl(null, [Validators.required]),
    due_date: new FormControl(null, [Validators.required]),
    invoice_number: new FormControl(null),
    invoice_photo: new FormControl(null),
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
    this.loading = true;
    this.purchasingService.getPurchasingDetail(purchase_id).subscribe({
      next: (res) => {
        console.log({ getDetail: res })
        this.purchasingDetail = res;
        const valToPatch = {
          supplier: res.supplier._id,
          due_date: nativeToNgbDate(res.due_date),
          invoice_number: res.invoice_number,
          invoice_photo: res.invoice_photo
        }
        this.patchFileVal = res.invoice_photo
        this.form.patchValue(valToPatch)
        console.log({ valToPatch })
        this.loading = false;
      }, error: () => {
        this.loading = false;
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
    const body = this.createFormData(this.form.value);
    console.log({ body })
    let serviceArg = this.purchasingService.createPurchasing(body);
    if (this.purchase_id) serviceArg = this.purchasingService.editPurchasing(this.purchase_id, body)
    serviceArg.subscribe({
      next: (res) => {
        this.alert.success(`Success ${this.purchase_id ? 'edit' : 'create'} purchasing!`);
        if (!this.purchase_id) {
          this.purchase_id = res._id;
          this.router.navigate([`../form/${this.purchase_id}`], { relativeTo: this.route, queryParams: { type: 'edit' } }).then(() => {
            setTimeout(() => {
              this.submitPO.emit()
            }, 100);
          })
        } else {
          this.submitPO.emit()
        }
      }
    })
  }

  createFormData(val) {
    const fd = new FormData();
    if (val.supplier) fd.append('supplier', val.supplier);
    if (val.due_date) fd.append('due_date', ngbToNativeDate(val.due_date)!.toISOString());
    if (val.invoice_number) fd.append('invoice_number', val.invoice_number);
    if (val.invoice_photo) { fd.append('invoice_photo', val.invoice_photo) }
    return fd;
  }

  addFile(evt: IFielImg) {
    this.deleteFile();
    this.patchFileVal = evt.str;
    this.form.controls.invoice_photo.patchValue(evt.file);
  }

  deleteFile() {
    this.form.controls.invoice_photo.reset();
    this.patchFileVal = undefined;
  }
}
