import { Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmModal } from '../../../../shared/components/modals/confirm-modal/confirm-modal';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { DATE_FORMAT } from '../../../../types/constants/common.constants';
import { ExpenseEn, IExpense } from '../../../../types/interfaces/expense.interface';
import { ExpenseService } from '../expense.service';
import { FormsModule } from '@angular/forms';
import { RupiahPipe } from '../../../../shared/pipes/rupiah.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-expense-detail',
  imports: [DatePipe, ConfirmModal, FormsModule, RupiahPipe, TranslateModule],
  templateUrl: './expense-detail.html',
  styleUrl: './expense-detail.scss'
})
export class ExpenseDetail {
  @ViewChild('DeleteModal') confirmDelete?: ConfirmModal;
  @ViewChild('RequestModal') confirmRequest?: ConfirmModal;
  @ViewChild('ExecuteModal') confirmExecute?: ConfirmModal;
  @ViewChild('RejectModal') confirmReject?: ConfirmModal;

  expenseId?: string;
  detail?: IExpense;
  isLoading = false;

  rejectNotes = '';

  ExpenseEn = ExpenseEn;
  DATE_FORMAT = DATE_FORMAT;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alert: AlertService,
    private expenseService: ExpenseService
  ) {
    this.expenseId = this.route.snapshot.paramMap.get('expense_id') || undefined;
    if (this.expenseId) {
      this.getDetail(this.expenseId);
    }
  }

  getDetail(expenseId: string) {
    this.isLoading = true;
    this.expenseService.getExpenseDetail(expenseId).subscribe({
      next: (res) => {
        this.detail = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  back() {
    this.router.navigate(['/expenses']);
  }

  edit() {
    this.router.navigate(['/expenses/form', this.expenseId]);
  }

  deleteExpense() {
    this.confirmDelete?.show().then((res: any) => {
      if (!res || !this.expenseId) return;
      this.expenseService.deleteExpense(this.expenseId).subscribe(() => {
        this.alert.success('Expense deleted successfully');
        this.back();
      });
    });
  }

  requestExpense() {
    this.confirmRequest?.show().then((res: any) => {
      if (!res || !this.expenseId) return;
      this.expenseService.requestExpense(this.expenseId).subscribe(() => {
        this.alert.success('Expense submitted for approval');
        this.getDetail(this.expenseId!);
      });
    });
  }

  approveExpense() {
    if (!this.expenseId) return;
    this.expenseService.approveExpense(this.expenseId).subscribe(() => {
      this.alert.success('Expense approved successfully');
      this.getDetail(this.expenseId!);
    });
  }

  rejectExpense() {
    this.rejectNotes = '';
    this.confirmReject?.show().then((res: any) => {
      if (!res || !this.expenseId) return;
      this.expenseService.rejectExpense(this.expenseId, this.rejectNotes).subscribe(() => {
        this.alert.success('Expense rejected successfully');
        this.getDetail(this.expenseId!);
      });
    });
  }

  executeExpense() {
    this.confirmExecute?.show().then((res: any) => {
      if (!res || !this.expenseId) return;
      this.expenseService.executeExpense(this.expenseId).subscribe(() => {
        this.alert.success('Expense completed successfully');
        this.getDetail(this.expenseId!);
      });
    });
  }
}
