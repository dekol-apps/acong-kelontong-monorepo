import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { InvestmentService } from '../investment.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { IRole } from '../../../types/interfaces/user.interface';
import { FormValidation } from '../../../shared/directives/form-validation/form-validation';
import { DragDropFileComponent, IFielImg } from '../../../shared/components/drag-drop-file/drag-drop-file.component';

export type investmentFormType = 'deposit' | 'withdrawal';
export type investmentFormPageType = 'input' | 'view';

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
    amount: new FormControl(null, [Validators.required]),
    evidence: new FormControl(null, [Validators.required]),
  });

  constructor(private service: InvestmentService, private alert: AlertService) { }

  ngAfterViewInit(): void {
    this.getDetail()
  }

  getDetail() {
    if (this.id) {
      if (this.type === 'deposit') {
        this.service.getDetailDeposit(this.id).subscribe((res) => {
          this.form.patchValue(res);
          console.log('this.form.value', this.form.value)
        })
      } else {
        this.service.getDetailWithdrawal(this.id).subscribe((res) => {
          this.form.patchValue(res);
          console.log('this.form.value', this.form.value)
        })
      }
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
    if (this.form.invalid) return this.alert.error('Please check your inputs');
    const body = this.form.value;
    let serviceArgs = this.service.createWithdrawal(body);
    if (this.type === 'deposit') serviceArgs = this.service.createDeposit(body);
    serviceArgs.subscribe((res) => {
      this.alert.success(`Success!`);
      this.close.emit(true);
    })
  }
}
