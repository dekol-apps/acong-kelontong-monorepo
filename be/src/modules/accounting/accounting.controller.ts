import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { UAuthGuard } from '../auth/auth.guard';
import { AccountingService } from './accounting.service';
import { PaginationDto } from 'src/global/global.dto';
import type { Response } from 'express';
import { BaseResponse } from 'src/utils/base-response';


@UseGuards(UAuthGuard)
@Controller('accounting')
export class AccountingController {
  constructor(
    private readonly service: AccountingService,
  ) { }

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
}
