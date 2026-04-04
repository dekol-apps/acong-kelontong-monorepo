import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { Permission } from 'src/global/permission.decoratior';
import { UAuthGuard } from '../auth/auth.guard';
import { ProductionService } from './production.service';
import { ListProductionDto, ProductionDto } from './production.dto';
import { Types } from 'mongoose';
import { BaseResponse } from 'src/utils/base-response';
import type { Response } from 'express';

@UseGuards(UAuthGuard)
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) { }

  @Permission(['production.view'])
  @Get()
  async list(
    @Query() query: ListProductionDto,
    @Res() res: Response,
  ) {
    try {
      const filter = query.status
        ? { column: 'status', value: query.status }
        : undefined;
      const { data, meta } = await this.productionService.list({ ...query, filter });
      return BaseResponse.success({ res, option: { message: 'Success get list production', list: data, meta } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['production.view'])
  @Get(':production_id')
  async detailProduction(
    @Param('production_id') id: string,
    @Res() res: Response,
  ) {
    try {
      const productionId = new Types.ObjectId(id);
      const production = await this.productionService.detail(productionId);
      return BaseResponse.success({ res, option: { message: "Success get detail production", detail: production } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['production.create'])
  @Post('')
  async createProduction(
    @Body() body: ProductionDto,
    @Res() res: Response,
  ) {
    try {
      const production = await this.productionService.create(body);
      return BaseResponse.success({ res, option: { message: "Success create production", detail: production } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['production.edit'])
  @Put(':production_id')
  async editProduction(
    @Param('production_id') productionId: string,
    @Body() body: ProductionDto,
    @Res() res: Response,
  ) {
    try {
      const production = await this.productionService.update(new Types.ObjectId(productionId), body);
      return BaseResponse.success({ res, option: { message: "Success edit production", detail: production } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }


  @Permission(['production.edit'])
  @Patch(':id/start')
  async start(@Param('id') id: string) {
    return this.productionService.start(new Types.ObjectId(id));
  }

  @Permission(['production.edit'])
  @Patch(':id/finish')
  async finish(@Param('id') id: string) {
    return this.productionService.finish(new Types.ObjectId(id));
  }


  @Permission(['production.delete'])
  @Delete(':production_id')
  async deleteProduction(
    @Param('production_id') productionId: string,
    @Res() res: Response,
  ) {
    try {
      const production = await this.productionService.remove(new Types.ObjectId(productionId));
      return BaseResponse.success({ res, option: { message: "Success delete production", detail: production } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }
}
