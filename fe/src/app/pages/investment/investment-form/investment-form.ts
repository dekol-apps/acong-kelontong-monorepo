import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { InvestmentService } from '../investment.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { IRole } from '../../../types/interfaces/user.interface';
import { FormValidation } from '../../../shared/directives/form-validation/form-validation';
import { IFielImg } from '../../../shared/components/drag-drop-file/drag-drop-file.component';
import { InvestmentType } from '../../../types/interfaces/common.interface';
import { decimalToNumber, objToFormData } from '../../../utils/helper';
import { DragDropFileMulti } from '../../../shared/components/drag-drop-file-multi/drag-drop-file-multi';

export type investmentFormType = 'deposit' | 'withdrawal';
export type investmentFormPageType = 'new' | 'edit' | 'view';
@Component({
  selector: 'app-investment-form',
  imports: [ReactiveFormsModule, FormValidation, DragDropFileMulti],
  standalone: true,
  templateUrl: './investment-form.html',
  styleUrl: './investment-form.scss'
})
export class InvestmentForm implements AfterViewInit {
  @Input() type: investmentFormType = 'deposit';
  @Input() page: investmentFormPageType = 'view';
  @Input() id?: string;
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>()

  isLoading: boolean = false;
  roles: IRole[] = [];

  form: FormGroup = new FormGroup({
    transaction_amount: new FormControl(null, [Validators.required]),
    investment_type: new FormControl(null, [Validators.required]),
    attachments: new FormControl(null),
    description: new FormControl(null),
  });

  constructor(private service: InvestmentService, private alert: AlertService) { }

  clickEdit() {
    this.page = 'edit'; window.scroll(0, 0);
  }

  ngAfterViewInit(): void {
    this.getDetail()
  }

  getDetail() {
    if (this.id) {
      this.service.getDetailInvestment(this.id).subscribe((res) => {
        this.form.patchValue(res);
        this.form.patchValue({
          attachments: res.attachments?.map(it => {
            return { src: it, file: null }
          })
        })
        this.form.controls.transaction_amount.patchValue(decimalToNumber(res.transaction_amount?.$numberDecimal));
        console.log('this.form.value', this.form.value)
      })
    }
  }

  addFile(evt: IFielImg[]) {
    this.deleteFile();
    this.form.controls.attachments.patchValue(evt);
  }

  deleteFile() {
    this.form.controls.attachments.reset();
  }

  submit() {
    if (this.type === 'deposit') this.form.controls.investment_type.patchValue(InvestmentType.DEPOSIT)
    else this.form.controls.investment_type.patchValue(InvestmentType.WITHDRAWAL);
    if (this.form.invalid) return this.alert.error('Please check your inputs');
    const body = {
      ...this.form.value,
      attachments: this.form.value.attachments?.map(it => it.file ?? it.src)
    };
    const formData = objToFormData(body, { fileFields: ['attachments'] });
    let serviceArgs = this.service.createInvestment(formData);
    if (this.page === 'edit') {
      serviceArgs = this.service.editInvestment(this.id, formData);
    }
    serviceArgs.subscribe((res) => {
      this.alert.success(`Success!`);
      this.close.emit(true);
    })
  }
}
