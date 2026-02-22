import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { BaseResponse } from 'src/utils/base-response';
import { SaleDto, SellingSaleDto } from './sale-dto';
import { SaleService } from './sale.service';
import type { Response } from 'express';
import { PaginationDto } from 'src/global/global.dto';

@Controller('sale')
export class SaleController {
  constructor(
    private readonly service: SaleService,
  ) { }

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
}
