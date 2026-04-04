import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { GlobalService } from './global.service';
import { BaseResponse } from 'src/utils/base-response';
import type { Response } from 'express';
import { UAuthGuard } from 'src/modules/auth/auth.guard';

@Controller('global')
export class GlobalController {

  constructor(
    private readonly service: GlobalService,
  ) { }

  @UseGuards(UAuthGuard)
  @Get('permissions')
  listPermission(
    @Res() res: Response,
  ) {
    try {
      const data = this.service.getPermissions();
      return BaseResponse.success({
        res,
        option: { message: 'Success get list permission', detail: data },
      });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }
}
