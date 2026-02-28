import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { InvestmentService } from '../investment.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { IRole } from '../../../types/interfaces/user.interface';
import { FormValidation } from '../../../shared/directives/form-validation/form-validation';
import { DragDropFileComponent, IFielImg } from '../../../shared/components/drag-drop-file/drag-drop-file.component';
import { InvestmentType } from '../../../types/interfaces/common.interface';
import { decimalToNumber } from '../../../utils/helper';

export type investmentFormType = 'deposit' | 'withdrawal';
export type investmentFormPageType = 'new' | 'edit' | 'view';
@Component({
  selector: 'app-investment-form',
  imports: [ReactiveFormsModule, FormValidation, DragDropFileComponent],
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
  patchFileVal?: string = '';
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
        this.form.controls.transaction_amount.patchValue(decimalToNumber(res.transaction_amount?.$numberDecimal));
        console.log('this.form.value', this.form.value)
      })
    }
  }

  addFile(evt: IFielImg) {
    this.deleteFile();
    this.patchFileVal = evt.str;
    this.form.controls.evidence.patchValue(evt.file);
  }

  deleteFile() {
    this.form.controls.evidence.reset();
    this.patchFileVal = undefined;
  }

  submit() {
    if (this.type === 'deposit') this.form.controls.investment_type.patchValue(InvestmentType.DEPOSIT)
    else this.form.controls.investment_type.patchValue(InvestmentType.WITHDRAWAL);
    if (this.form.invalid) return this.alert.error('Please check your inputs');
    const body = this.form.value;
    let serviceArgs = this.service.createInvestment(body);
    if (this.page === 'edit') {
      serviceArgs = this.service.editInvestment(this.id, body);
    }
    serviceArgs.subscribe((res) => {
      this.alert.success(`Success!`);
      this.close.emit(true);
    })
  }
}
