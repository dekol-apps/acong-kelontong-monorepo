import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BaseService } from '../../../services/rest-api/base-service';
import { Endpoint } from '../../../types/constants/endpoint';
import { ApprovalType } from '../../../types/enums/common.enum';
import { IExpense } from '../../../types/interfaces/expense.interface';
import { IResDetail, IResList } from '../../../types/interfaces/http.interface';
import { ITableQueryData } from '../../../shared/components/generic-table/generic-table';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService extends BaseService {
  getExpenses(qParams: ITableQueryData): Observable<IResList<IExpense>> {
    return this.getRequest({ url: Endpoint.EXPENSE, qParams, spinner: false });
  }

  getExpenseDetail(expenseId: string): Observable<IExpense> {
    return this.getRequest({ url: Endpoint.EXPENSE_ID(expenseId) }).pipe(
      map((res: IResDetail<IExpense>) => res.detail)
    );
  }

  createExpense(body: FormData): Observable<IExpense> {
    return this.postRequest({ url: Endpoint.EXPENSE, body }).pipe(
      map((res: IResDetail<IExpense>) => res.detail)
    );
  }

  editExpense(expenseId: string, body: FormData): Observable<IExpense> {
    return this.putRequest({ url: Endpoint.EXPENSE_ID(expenseId), body }).pipe(
      map((res: IResDetail<IExpense>) => res.detail)
    );
  }

  deleteExpense(expenseId: string): Observable<IExpense> {
    return this.deleteRequest({ url: Endpoint.EXPENSE_ID(expenseId) }).pipe(
      map((res: IResDetail<IExpense>) => res.detail)
    );
  }

  requestExpense(expenseId: string): Observable<IExpense> {
    return this.putRequest({ url: Endpoint.EXPENSE_REQUEST(expenseId) }).pipe(
      map((res: IResDetail<IExpense>) => res.detail)
    );
  }

  approveExpense(expenseId: string): Observable<IExpense> {
    return this.putRequest({
      url: Endpoint.EXPENSE_APPROVAL(expenseId),
      body: { approval: ApprovalType.APPROVE }
    }).pipe(map((res: IResDetail<IExpense>) => res.detail));
  }

  rejectExpense(expenseId: string, rejectNotes: string): Observable<IExpense> {
    return this.putRequest({
      url: Endpoint.EXPENSE_APPROVAL(expenseId),
      body: { approval: ApprovalType.REJECT, reject_notes: rejectNotes }
    }).pipe(map((res: IResDetail<IExpense>) => res.detail));
  }

  executeExpense(expenseId: string): Observable<IExpense> {
    return this.putRequest({ url: Endpoint.EXPENSE_EXECUTE(expenseId) }).pipe(
      map((res: IResDetail<IExpense>) => res.detail)
    );
  }
}
