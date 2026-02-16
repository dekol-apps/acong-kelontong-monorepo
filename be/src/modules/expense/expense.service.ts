import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types, ClientSession } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { AccountingService } from '../accounting/accounting.service';
import { Expense, ExpenseStatus } from './expense.schema';
import { ExpenseApprovalDto, ExpenseDto } from './expense.dto';
import { ApprovalType, FlowType, IListRes, OrderType } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { PaginationDto } from 'src/global/global.dto';

@Injectable()
export class ExpenseService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @Inject(forwardRef(() => AccountingService))
    private accounting: AccountingService,
    @InjectModel(Expense.name)
    private expenseModel: Model<Expense>,
    @InjectConnection()
    private readonly connection: Connection,
  ) { }

  async createExpense(data: ExpenseDto) {
    return this.global.withTransaction(async (session) => {
      const expense = await this.expenseModel.create([{
        ...data,
        status: ExpenseStatus.CREATE,
      }], { session });

      return expense[0];
    });
  }

  async editExpense(expense_id: Types.ObjectId, data: ExpenseDto, sessionIn?: ClientSession,
  ): Promise<{ detail: Expense; removedAttachments: string[] }> {
    return this.global.withTransaction(async (session) => {
      const expense = await this.expenseModel.findById(expense_id).session(session);
      if (!expense) {
        throw BaseResponse.notFound({ err: 'Expense not found' });
      }
      if (expense.status !== ExpenseStatus.CREATE && expense.status !== ExpenseStatus.REQUEST && expense.status !== ExpenseStatus.REJECT) {
        throw BaseResponse.invalid({ option: { message: `Failed, edit expense only available for status CREATE, REQUEST or REJECT` } })
      }
      const oldAttachments = expense.expense_attachments ?? [];
      const newAttachments = data.expense_attachments ?? oldAttachments;
      const removedAttachments = oldAttachments.filter(
        (url) => !newAttachments.includes(url),
      );
      const updated = await this.expenseModel.findByIdAndUpdate(
        expense_id,
        { $set: data },
        { new: true, runValidators: true, session },
      );

      if (!updated) {
        throw BaseResponse.notFound({ err: 'Updated investment not found' });
      }

      return {
        detail: updated,
        removedAttachments,
      };
    }, sessionIn);
  }


  async listExpense({
    page,
    size,
    sortBy,
    sortDir,
    search,
    filter
  }: PaginationDto): Promise<IListRes<Expense>> {
    const searchFields: string[] = ['subject'];

    return this.global.getList<Expense>(
      this.expenseModel,
      {
        page,
        size,
        sortBy,
        sortDir,
        search,
        searchFields,
        filter
      }
    )
  }

  async detailExpense(expense_id: Types.ObjectId): Promise<Expense> {
    const detailExpense = await this.expenseModel
      .findById(expense_id)
      .lean(); // <-- important
    if (!detailExpense) throw BaseResponse.notFound();
    return detailExpense;
  }

  async deleteExpense(id: Types.ObjectId, sessionIn?: ClientSession): Promise<{ detail: Expense | undefined; removedAttachments: string[] }> {
    return this.global.withTransaction(async (session) => {
      const expense = await this.expenseModel.findById(id).session(session);
      if (!expense) throw BaseResponse.notFound({ err: 'deleteExpense !expense', option: { message: 'Expense not found' } });
      const allowedStatus = [ExpenseStatus.CREATE, ExpenseStatus.REQUEST, ExpenseStatus.REJECT];
      if (!allowedStatus.includes(expense.status)) {
        BaseResponse.forbidden({ err: 'deleteExpense !allowedStatus', option: { message: `Cannot delete item with status ${expense.status}` } });
      }
      const removedAttachments = expense.expense_attachments ?? [];

      await this.global.deleteData(expense, session);

      return {
        detail: expense,
        removedAttachments,
      };
    }, sessionIn);
  }

  async expenseRequest(id: Types.ObjectId) {
    return this.global.withTransaction(async (session) => {
      const expense = await this.expenseModel.findById(id).session(session);
      if (!expense) throw BaseResponse.notFound({ err: 'expenseApproval !expense' });
      if (expense.status !== ExpenseStatus.CREATE && expense.status !== ExpenseStatus.REJECT) {
        throw BaseResponse.invalid({ option: { message: `Failed, request expense only available for status CREATE or REJECT` } })
      }
      if (expense.status === ExpenseStatus.REJECT) {
        expense.reject_notes = undefined; // reset reject_notes on RE-REQUEST
      }
      expense.status = ExpenseStatus.REQUEST;
      await expense.save({ session });
      return expense;
    });
  }

  async expenseApproval(id: Types.ObjectId, data: ExpenseApprovalDto) {
    return this.global.withTransaction(async (session) => {
      const expense = await this.expenseModel.findById(id).session(session);
      if (!expense) throw BaseResponse.notFound({ err: 'expenseApproval !expense' });

      if (data.approval === ApprovalType.APPROVE) {
        expense.status = ExpenseStatus.APPROVE;
        expense.reject_notes = undefined;
      } else {
        expense.status = ExpenseStatus.REJECT;
        expense.reject_notes = data.reject_notes;
      }
      await expense.save({ session });
      return expense;
    });
  }

  async expenseExecute(id: Types.ObjectId) {
    return this.global.withTransaction(async (session) => {
      const expense = await this.expenseModel.findById(id).session(session);
      if (!expense) throw BaseResponse.notFound();
      if (expense.status !== ExpenseStatus.APPROVE) {
        throw BaseResponse.forbidden({
          err: 'Expense must be APPROVED first'
        });
      }
      // Update status
      expense.status = ExpenseStatus.COMPLETE;
      await expense.save({ session });
      // Create accounting record
      await this.accounting.createAccountingItem({
        flow_type: FlowType.OUT,
        order_id: expense._id,
        order_data: expense,
        order_type: OrderType.EXPENSE,
        transaction_amount: expense.transaction_amount,
      }, session);
      return expense;
    });
  }

}