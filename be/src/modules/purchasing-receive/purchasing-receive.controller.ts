import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { PaginationDto } from 'src/global/global.dto';
import { BaseResponse } from 'src/utils/base-response';
import type { Response } from 'express';
import { PurchasingService } from '../purchasing/purchasing.service';
import { UAuthGuard } from '../auth/auth.guard';
import { Permission } from 'src/global/permission.decoratior';
import { PurchasingEn } from '../purchasing/purchasing.schema';

@UseGuards(UAuthGuard)
@Controller('purchasing-receive')
export class PurchasingReceiveController {
  constructor(private readonly purchasing: PurchasingService) { }

  @Permission(['purchasing.view'])
  @Get('')
  async listPurchasingReceive(
    @Query() query: PaginationDto,
    @Res() res: Response,
  ) {
    try {
      const allowedStat = [PurchasingEn.PROCESS, PurchasingEn.RECEIVE, PurchasingEn.COMPLETE];
      const filter = query.filter && Array.isArray(query.filter) ? query.filter.filter(it => it.value && allowedStat.includes(it.value as PurchasingEn)) : allowedStat.map(it => { return { column: 'status', value: it } })
      const query2 = {
        ...query,
        filter
      }
      const { data, meta } = await this.purchasing.listPurchasing(query2);
      return BaseResponse.success({ res, option: { message: 'Success get list purchasing receive', list: data, meta } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }
}
