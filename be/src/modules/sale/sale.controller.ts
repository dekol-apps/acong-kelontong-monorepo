import { Body, Controller, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Permission } from 'src/global/permission.decoratior';
import { UAuthGuard } from '../auth/auth.guard';
import { BaseResponse } from 'src/utils/base-response';
import { SaleDto, SellingSaleDto } from './sale-dto';
import { SaleService } from './sale.service';
import type { Response } from 'express';
import { PaginationDto } from 'src/global/global.dto';

@UseGuards(UAuthGuard)
@Controller('sale')
export class SaleController {
  constructor(
    private readonly service: SaleService,
  ) { }

  @Permission(['sale.create'])
  @Post('stock')
  async addStock(
    @Body() body: SaleDto,
    @Res() res: Response,
  ) {
    try {
      const newStocks = await this.service.addStock(body);
      return BaseResponse.success({ res, option: { message: "Success create saleItem", list: newStocks } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['sale.view'])
  @Get('stock')
  async listStock(
    @Query() query: PaginationDto,
    @Res() res: Response,
  ) {
    try {
      const { data, meta } = await this.service.listStock(query);
      return BaseResponse.success({ res, option: { message: 'Success get list stock', list: data, meta } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['sale.create'])
  @Post('selling')
  async selling(
    @Body() body: SellingSaleDto,
    @Res() res: Response,
  ) {
    try {
      const saleDetail = await this.service.selling(body);
      return BaseResponse.success({ res, option: { message: "Success create sale transaction", detail: saleDetail } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['sale.edit'])
  @Post('selling/:id')
  async editSelling(
    @Body() body: SellingSaleDto,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    try {
      const saleDetail = await this.service.editSelling(id, body);
      return BaseResponse.success({ res, option: { message: "Success update sale transaction", detail: saleDetail } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }
}
