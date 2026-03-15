import { Body, Controller, Get, Param, Put, Query, Res, UseGuards } from '@nestjs/common';
import { PaginationDto } from 'src/global/global.dto';
import { BaseResponse } from 'src/utils/base-response';
import type { Response } from 'express';
import { Types } from 'mongoose';
import { PurchasingEn } from '../purchasing/purchasing.schema';
import { PurchasingService } from '../purchasing/purchasing.service';
import { UAuthGuard } from '../auth/auth.guard';
import { ApprovalType } from 'src/types/interfaces';
import { ExpenseService } from '../expense/expense.service';
import { ExpenseStatus } from '../expense/expense.schema';

@UseGuards(UAuthGuard)
@Controller('approval')
export class ApprovalController {
    constructor(
        private readonly purchasing: PurchasingService,
        private readonly expense: ExpenseService,
    ) { }

    @Get('purchasing')
    async listApprovalPurchasing(
        @Query() query: PaginationDto,
        @Res() res: Response,
    ) {
        try {
            const allowedStat = [PurchasingEn.REQUEST, PurchasingEn.APPROVE, PurchasingEn.PROCESS, PurchasingEn.RECEIVE, PurchasingEn.COMPLETE, PurchasingEn.REJECT];
            const filter = query.filter && Array.isArray(query.filter) ? query.filter.filter(it => it.value && allowedStat.includes(it.value as PurchasingEn)) : allowedStat.map(it => { return { column: 'status', value: it } })
            const query2 = {
                ...query,
                filter
            }
            const { data, meta } = await this.purchasing.listPurchasing(query2);
            return BaseResponse.success({ res, option: { message: 'Success get list purchasing', list: data, meta } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Put('purchasing/:purchasing_id/approve')
    async purchaseOrderApprove(
        @Param('purchasing_id') purchasingId: Types.ObjectId,
        @Res() res: Response,
    ) {
        try {
            const purchasing = await this.purchasing.purchasingApproval(purchasingId, { approval: ApprovalType.APPROVE });
            return BaseResponse.success({
                res,
                option: { message: `Purchase order approved`, detail: purchasing },
            });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Put('purchasing/:purchasing_id/reject')
    async purchaseOrderReject(
        @Param('purchasing_id') purchasingId: Types.ObjectId,
        @Body() dto: { reject_notes: string },
        @Res() res: Response,
    ) {
        try {
            const purchasing = await this.purchasing.purchasingApproval(purchasingId, { approval: ApprovalType.REJECT, reject_notes: dto.reject_notes });
            return BaseResponse.success({
                res,
                option: { message: `Purchase order rejected`, detail: purchasing },
            });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Get('expense')
    async listApprovalExpense(
        @Query() query: PaginationDto,
        @Res() res: Response,
    ) {
        try {
            const allowedStat = [ExpenseStatus.REQUEST, ExpenseStatus.APPROVE, ExpenseStatus.COMPLETE, ExpenseStatus.REJECT];
            const filter = query.filter && Array.isArray(query.filter) ? query.filter.filter(it => it.value && allowedStat.includes(it.value as ExpenseStatus)) : allowedStat.map(it => { return { column: 'status', value: it } })
            const query2 = {
                ...query,
                filter
            }
            const { data, meta } = await this.expense.listExpense(query2);
            return BaseResponse.success({ res, option: { message: 'Success get list expense', list: data, meta } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Put('expense/:expense_id/approve')
    async expenseApprove(
        @Param('expense_id') purchasingId: Types.ObjectId,
        @Res() res: Response,
    ) {
        try {
            const expense = await this.expense.expenseApproval(purchasingId, { approval: ApprovalType.APPROVE });
            return BaseResponse.success({
                res,
                option: { message: `Expense approved`, detail: expense },
            });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Put('expense/:expense_id/reject')
    async expenseReject(
        @Param('expense_id') purchasingId: Types.ObjectId,
        @Body() dto: { reject_notes: string },
        @Res() res: Response,
    ) {
        try {
            const expense = await this.expense.expenseApproval(purchasingId, { approval: ApprovalType.REJECT, reject_notes: dto.reject_notes });
            return BaseResponse.success({
                res,
                option: { message: `Expense rejected`, detail: expense },
            });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }
}