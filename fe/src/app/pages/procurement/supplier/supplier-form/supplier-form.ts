import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidation } from '../../../../shared/directives/form-validation/form-validation';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { formType } from '../../../../types/interfaces/common.interface';
import { SupplierService } from '../supplier.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-supplier-form',
  imports: [ReactiveFormsModule, FormValidation, TranslateModule],
  templateUrl: './supplier-form.html',
  styleUrl: './supplier-form.scss'
})
export class SupplierForm implements OnInit, AfterViewInit {
  @Input() type: formType = 'new';
  @Input() id?: string;
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>()

  isLoading: boolean = false;

  form: FormGroup = new FormGroup({
    supplier_name: new FormControl(null, [Validators.required]),
    supplier_phone: new FormControl(null, [Validators.required]),
    supplier_email: new FormControl(null, [Validators.required]),
    supplier_address: new FormControl(null, [Validators.required]),
  });

  constructor(private supplierService: SupplierService, private alert: AlertService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.id) {
      this.supplierService.getSupplierDetail(this.id).subscribe((res) => {
        this.form.patchValue({
          ...res
        });
        console.log('this.form.value', this.form.value)
      })
    }
  }

  submit() {
    if (this.form.invalid) return this.alert.error('Please check your inputs');
    const body = this.form.value;
    let serviceArgs = this.supplierService.createSupplier(body);
    if (this.type === 'edit' && this.id) serviceArgs = this.supplierService.editSupplier(this.id, body);
    serviceArgs.subscribe((res) => {
      this.alert.success(`Success ${this.type == 'edit' ? 'edit' : 'invite'} supplier!`);
      this.close.emit(true);
    })
  }
}