import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { UAuthGuard } from '../auth/auth.guard';
import { AccountingService } from './accounting.service';
import type { Response } from 'express';
import { BaseResponse } from 'src/utils/base-response';
import { ListAccountingDto, TaxTransactionFilterDto } from './accounting.dto';
import { Permission } from 'src/global/permission.decoratior';
import { FlowType } from 'src/types/interfaces';


@UseGuards(UAuthGuard)
@Controller('accounting')
export class AccountingController {
  constructor(
    private readonly service: AccountingService,
  ) { }

  @Permission(['finance_report.view'])
  @Get('')
  async getPortofolio(
    @Res() res: Response
  ) {
    try {
      const detail = await this.service.getPortofolio();
      return BaseResponse.success({ res, option: { message: 'Success get portofolio', detail } });
    } catch (err) {
      return BaseResponse.error({ res, err })
    }
  }

  @Permission(['cashflow.view'])
  @Get('history')
  async getAccountingHistory(
    @Res() res: Response,
    @Query() dto: ListAccountingDto,
  ) {
    try {
      const result = await this.service.listAccountingHistory(dto);
      return BaseResponse.success({ res, option: { message: 'Success get accounting history', list: result.data, meta: result.meta } });
    } catch (err) {
      return BaseResponse.error({ res, err })
    }
  }

  @Permission(['cashflow.view'])
  @Get('history/:id')
  async getAccountingDetail(
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    try {
      const detail = await this.service.getAccountingById(id);
      return BaseResponse.success({ res, option: { message: 'Success get accounting detail', detail } });
    } catch (err) {
      return BaseResponse.error({ res, err })
    }
  }

  @Permission(['cashflow.view'])
  @Get('tax-transactions')
  async getTaxTransactions(
    @Res() res: Response,
    @Query() filter: TaxTransactionFilterDto,
  ) {
    try {
      const result = await this.service.listTaxTransactions(filter);
      return BaseResponse.success({ res, option: { message: 'Success get tax transactions', list: result.data, meta: result.meta } });
    } catch (err) {
      return BaseResponse.error({ res, err })
    }
  }
}
