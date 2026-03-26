import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { DragDropFileMulti } from '../../../../shared/components/drag-drop-file-multi/drag-drop-file-multi';
import { IFielImg } from '../../../../shared/components/drag-drop-file/drag-drop-file.component';
import { FormValidation } from '../../../../shared/directives/form-validation/form-validation';
import { PPhType } from '../../../../types/enums/common.enum';
import { ExpenseEn } from '../../../../types/interfaces/expense.interface';
import { MONEY_REGEX, decimalToNumber, objToFormData, toMoneyString } from '../../../../utils/helper';
import { ExpenseService } from '../expense.service';

@Component({
  selector: 'app-expense-form',
  imports: [CommonModule, ReactiveFormsModule, FormValidation, DragDropFileMulti],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.scss'
})
export class ExpenseForm {
  expenseId?: string;
  isLoading = false;
  isEditMode = false;
  detailStatus?: ExpenseEn;

  PPhType = PPhType;
  ExpenseEn = ExpenseEn;

  form: FormGroup = new FormGroup({
    subject: new FormControl(null, [Validators.required]),
    expense_date: new FormControl(null, [Validators.required]),
    transaction_amount: new FormControl(null, [Validators.required, Validators.pattern(MONEY_REGEX)]),
    pph_type: new FormControl(PPhType.NONE),
    pph_rate: new FormControl(0, [Validators.min(0), Validators.max(100)]),
    notes: new FormControl(null),
    expense_attachments: new FormControl<IFielImg[] | null>(null, [Validators.required]),
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alert: AlertService,
    private expenseService: ExpenseService
  ) {
    this.expenseId = this.route.snapshot.paramMap.get('expense_id') || undefined;
    this.isEditMode = !!this.expenseId;

    if (this.expenseId) {
      this.getDetail(this.expenseId);
    }
  }

  private dateInputValue(value?: Date | string): string | null {
    if (!value) return null;
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return null;
    return dt.toISOString().slice(0, 10);
  }

  getDetail(expenseId: string) {
    this.expenseService.getExpenseDetail(expenseId).subscribe({
      next: (res) => {
        this.detailStatus = res.status;
        this.form.patchValue({
          ...res,
          expense_date: this.dateInputValue(res.expense_date),
          transaction_amount: decimalToNumber(res.transaction_amount),
          expense_attachments: res.expense_attachments?.map((item) => ({ src: item, file: null }))
        });

        if (res.status !== ExpenseEn.CREATE && res.status !== ExpenseEn.REJECT) {
          this.form.disable();
        }
      }
    });
  }

  addFile(files: IFielImg[]) {
    if (!files.length) {
      this.form.controls.expense_attachments.reset();
      return;
    }
    this.form.controls.expense_attachments.patchValue(files);
  }

  submit() {
    if (this.form.invalid) {
      this.alert.error('Please check your inputs');
      return;
    }

    const val = this.form.value;
    const expenseDate = val.expense_date ? new Date(val.expense_date) : undefined;
    const pphRate = Number(val.pph_rate ?? 0);
    const pphType = val.pph_type || PPhType.NONE;

    const body = {
      subject: val.subject,
      expense_date: expenseDate,
      transaction_amount: toMoneyString(val.transaction_amount),
      pph_type: pphType,
      pph_rate: pphType === PPhType.NONE ? 0 : pphRate,
      notes: val.notes,
      expense_attachments: val.expense_attachments?.map((it) => it.file ?? it.src),
    };

    const formData = objToFormData(body, { fileFields: ['expense_attachments'] });
    this.isLoading = true;

    const action = this.isEditMode && this.expenseId
      ? this.expenseService.editExpense(this.expenseId, formData)
      : this.expenseService.createExpense(formData);

    action.subscribe({
      next: (res) => {
        this.alert.success('Expense saved successfully');
        this.isLoading = false;
        if (res._id) {
          this.router.navigate(['/expenses/detail', res._id]);
          return;
        }
        this.router.navigate(['/expenses']);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  back() {
    if (this.expenseId) {
      this.router.navigate(['/expenses/detail', this.expenseId]);
      return;
    }
    this.router.navigate(['/expenses']);
  }
}
