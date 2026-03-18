import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { Permission } from 'src/global/permission.decoratior';
import { UAuthGuard } from '../auth/auth.guard';
import { PaginationDto } from 'src/global/global.dto';
import { BaseResponse } from 'src/utils/base-response';
import { Supplier } from './supplier.schema';
import { SupplierService } from './supplier.service';
import type { Response } from 'express';
import { Types } from 'mongoose';

@UseGuards(UAuthGuard)
@Controller('supplier')
export class SupplierController {
    constructor(
      private readonly service: SupplierService,
    ) { }

  @Permission(['supplier.create'])
  @Post('')
  async createSupplier(
    @Body() body: Supplier,
    @Res() res: Response,
  ) {
    try {
      const supplier = await this.service.createSupplier(body);
      return BaseResponse.success({ res, option: { message: "Success create supplier", detail: supplier } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['supplier.view'])
  @Get('')
  async listSupplier(
    @Query() query: PaginationDto,
    @Res() res: Response,
  ) {
    try {
      const { data, meta } = await this.service.listSupplier(query);
      return BaseResponse.success({ res, option: { message: 'Success get list supplier', list: data, meta } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['supplier.edit'])
  @Put(':supplier_id')
  async editSupplier(
    @Param('supplier_id') supplierId: Types.ObjectId,
    @Body() body: Supplier,
    @Res() res: Response,
  ) {
    try {
      const supplier = await this.service.editSupplier(supplierId, body);
      return BaseResponse.success({ res, option: { message: "Success edit supplier", detail: supplier } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['supplier.view'])
  @Get(':supplier_id')
  async detailSupplier(
    @Param('supplier_id') supplierId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const supplier = await this.service.detailSupplier(supplierId);
      return BaseResponse.success({ res, option: { message: "Success get detail supplier", detail: supplier } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }


  @Permission(['supplier.delete'])
  @Delete(':supplier_id')
  async deleteSupplier(
    @Param('supplier_id') supplierId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const supplier = await this.service.deleteSupplier(supplierId);
      return BaseResponse.success({ res, option: { message: "Success get detail supplier", detail: supplier } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }
}
