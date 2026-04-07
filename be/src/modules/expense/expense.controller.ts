import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UploadedFiles, UseGuards } from '@nestjs/common';
import { Permission } from 'src/global/permission.decoratior';
import { UAuthGuard } from '../auth/auth.guard';
import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { AttachmentsInterceptor } from 'src/global/attachments-interceptor';
import { PaginationDto } from 'src/global/global.dto';
import { BaseResponse } from 'src/utils/base-response';
import { ExpenseApprovalDto, ExpenseDto } from './expense.dto';
import { ExpenseService } from './expense.service';
import * as fs from 'fs';
import { ExpenseStatus } from './expense.schema';

interface headerArgs {
  expenseId?: Types.ObjectId,
  files?: Express.Multer.File[]
  req: Request,
  dto?: ExpenseDto,
  res: Response,
}
@UseGuards(UAuthGuard)
@Controller('expense')
export class ExpenseController {
  constructor(
    private readonly service: ExpenseService,
  ) { }

  private getUploadDirs(files: Express.Multer.File[] = []): string[] {
    return Array.from(new Set(files.map((file) => file.destination).filter(Boolean)));
  }

  async expenseMutation<T>(
    args: headerArgs,
    cb: () => Promise<T>,
  ): Promise<T> {
    try {
      if (args.files?.length && args.dto) {
        const existingAttachments = args.dto.expense_attachments?.filter(item => typeof item === 'string') ?? [];
        const newAttachements = args.files.map((file) => {
          const normalizedDestination = file.destination.replace(/\\/g, '/');
          return `${args.req.protocol}://${args.req.get('host')}/${normalizedDestination}/${file.filename}`;
        });
        args.dto.expense_attachments = [...existingAttachments, ...newAttachements]
      }

      return await cb();
    } catch (err) {
      if (args.files?.length) {
        const dirs = this.getUploadDirs(args.files);
        dirs.forEach((dirPath) => fs.rmSync(dirPath, { recursive: true, force: true }));
      }
      return BaseResponse.error({ res: args.res, err });
    }
  }

  @Permission(['expenses.create'])
  @Post('')
  @AttachmentsInterceptor('expense_attachments', 5)
  async createExpense(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: ExpenseDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.expenseMutation({ files, dto, req, res }, async () => {
      const data: ExpenseDto & { status: ExpenseStatus } = {
        ...dto,
        status: ExpenseStatus.CREATE
      }
      const expense = await this.service.createExpense(data);
      return BaseResponse.success({ res, option: { message: "Success create expense", detail: expense } });
    })
  }

  @Permission(['expenses.view'])
  @Get('')
  async listExpense(
    @Query() query: PaginationDto,
    @Res() res: Response,
  ) {
    try {
      const { data, meta } = await this.service.listExpense(query);
      return BaseResponse.success({ res, option: { message: 'Success get list expense', list: data, meta } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['expenses.view'])
  @Get(':expense_id')
  async detailExpense(
    @Param('expense_id') expenseId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const expense = await this.service.detailExpense(expenseId);
      return BaseResponse.success({ res, option: { message: "Success get detail expense", detail: expense } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['expenses.edit'])
  @Put(':expense_id')
  @AttachmentsInterceptor('expense_attachments', 5)
  async editExpense(
    @Param('expense_id') expenseId: Types.ObjectId,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
    @Body() dto: ExpenseDto,
    @Res() res: Response,
  ) {
    return this.expenseMutation({ files, dto, req, res }, async () => {
      const { detail, removedAttachments } = await this.service.editExpense(expenseId, dto);
      // delete old files AFTER DB success
      removedAttachments.forEach((url) => {
        try {
          const pathname = new URL(url).pathname;
          fs.rmSync(`.${pathname}`, { force: true });
        } catch (_e) {
          console.warn('Failed to remove attachment:', url);
        }
      });
      return BaseResponse.success({
        res,
        option: { message: 'Success edit expense', detail },
      });
    })
  }

  @Permission(['expenses.edit'])
  @Put(':expense_id/request')
  async expenseRequest(
    @Param('expense_id') expenseId: Types.ObjectId,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const expense = await this.service.expenseRequest(expenseId);
      return BaseResponse.success({
        res,
        option: { message: `Expense on approval`, detail: expense },
      });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['approval_expense.create'])
  @Put(':expense_id/approval')
  async expenseApproval(
    @Param('expense_id') expenseId: Types.ObjectId,
    @Req() req: Request,
    @Body() dto: ExpenseApprovalDto,
    @Res() res: Response,
  ) {
    try {
      const expense = await this.service.expenseApproval(expenseId, dto);
      return BaseResponse.success({
        res,
        option: { message: `Expense success ${dto.approval}`, detail: expense },
      });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['expenses.edit'])
  @Put(':expense_id/execute')
  async expenseExecute(
    @Param('expense_id') expenseId: Types.ObjectId,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const expense = await this.service.expenseExecute(expenseId);
      return BaseResponse.success({
        res,
        option: { message: `Expense executed`, detail: expense },
      });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }

  }


  @Permission(['expenses.delete'])
  @Delete(':expense_id')
  async deleteExpense(
    @Param('expense_id') expenseId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const { detail, removedAttachments } = await this.service.deleteExpense(expenseId);
      // delete old files AFTER DB success
      removedAttachments.forEach((url) => {
        try {
          const pathname = new URL(url).pathname;
          fs.rmSync(`.${pathname}`, { force: true });
        } catch (_e) {
          console.warn('Failed to remove attachment:', url);
        }
      });
      return BaseResponse.success({ res, option: { message: "Success get detail expense", detail } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }
}
