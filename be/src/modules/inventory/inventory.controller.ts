import { Body, Controller, Delete, Get, Param, Put, Query, Res, UseGuards } from '@nestjs/common';
import { UAuthGuard } from '../auth/auth.guard';
import { InventoryService } from './inventory.service';
import type { Response } from 'express';
import { BaseResponse } from 'src/utils/base-response';
import { PaginationDto } from 'src/global/global.dto';
import { Types } from 'mongoose';
import { InventoryDto } from './inventory.dto';

@UseGuards(UAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly service: InventoryService,
  ) { }

  @Get('')
  async listInventory(
    @Query() query: PaginationDto,
    @Res() res: Response,
  ) {
    try {
      const { data, meta } = await this.service.listInventory(query);
      return BaseResponse.success({ res, option: { message: 'Success get list inventory', list: data, meta } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Put(':inventory_id')
  async editInventory(
    @Param('inventory_id') inventoryId: Types.ObjectId,
    @Body() body: InventoryDto,
    @Res() res: Response,
  ) {
    try {
      const inventory = await this.service.editInventory(inventoryId, body);
      return BaseResponse.success({ res, option: { message: "Success edit inventory", detail: inventory } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Get(':inventory_id')
  async detailInventory(
    @Param('inventory_id') inventoryId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const inventory = await this.service.detailInventory(inventoryId);
      return BaseResponse.success({ res, option: { message: "Success get detail inventory", detail: inventory } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }


  @Delete(':inventory_id')
  async deleteInventory(
    @Param('inventory_id') inventoryId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const inventory = await this.service.deleteInventory(inventoryId);
      return BaseResponse.success({ res, option: { message: "Success get detail inventory", detail: inventory } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }
}
