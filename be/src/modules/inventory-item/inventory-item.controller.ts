import { Body, Controller, Delete, Get, Param, Post, Put, Res, Query, UseGuards } from '@nestjs/common';
import { Permission } from 'src/global/permission.decoratior';
import { UAuthGuard } from '../auth/auth.guard';
import { Types } from 'mongoose';
import type { Response } from 'express';
import { BaseResponse } from 'src/utils/base-response';
import { InventoryItemDto, InventoryReconcileDto } from './inventory-item.dto';
import { InventoryItemService } from './inventory-item.service';
import { PaginationDto } from 'src/global/global.dto';

@UseGuards(UAuthGuard)
@Controller('inventory-item')
export class InventoryItemController {

  constructor(
    private readonly service: InventoryItemService,
  ) { }

  @Permission(['inventory.create'])
  @Post('')
  async createInventoryItem(
    @Body() body: InventoryItemDto,
    @Res() res: Response,
  ) {
    try {
      const inventoryItem = await this.service.createInventoryItem(body);
      return BaseResponse.success({ res, option: { message: "Success create inventoryItem", detail: inventoryItem } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['inventory.view'])
  @Get('')
  async listInventoryItems(
    @Query() query: PaginationDto,
    @Res() res: Response,
  ) {
    try {
      const { data, meta } = await this.service.listInventoryItems(query);
      return BaseResponse.success({ res, option: { message: 'Success get list inventory item', list: data, meta } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['inventory.edit'])
  @Put('reconcile')
  async inventoryReconcile(
    @Body() body: InventoryReconcileDto,
    @Res() res: Response,
  ) {
    try {
      const detail = await this.service.reconcile(body);
      return BaseResponse.success({ res, option: { message: "Success create inventory reconciliation", detail } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['inventory.edit'])
  @Put('item/:inventory_item_id')
  async editInventoryItem(
    @Param('inventory_item_id') inventoryItemId: Types.ObjectId,
    @Body() body: InventoryItemDto,
    @Res() res: Response,
  ) {
    try {
      const inventoryItem = await this.service.editInventoryItem(inventoryItemId, body);
      return BaseResponse.success({ res, option: { message: "Success edit inventoryItem", detail: inventoryItem } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['inventory.view'])
  @Get('item/:inventory_item_id')
  async detailInventoryItem(
    @Param('inventory_item_id') inventoryItemId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const inventoryItem = await this.service.detailInventoryItem(inventoryItemId);
      return BaseResponse.success({ res, option: { message: "Success get detail inventoryItem", detail: inventoryItem } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }


  @Permission(['inventory.delete'])
  @Delete('item/:inventory_item_id')
  async deleteInventoryItem(
    @Param('inventory_item_id') inventoryItemId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const inventoryItem = await this.service.deleteInventoryItem(inventoryItemId);
      return BaseResponse.success({ res, option: { message: "Success get detail inventoryItem", detail: inventoryItem } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }
}

