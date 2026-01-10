import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import { Types } from 'mongoose';
import type { Response } from 'express';
import { BaseResponse } from 'src/utils/base-response';
import { InventoryItemDto } from './inventory-item.dto';
import { InventoryItemService } from './inventory-item.service';

@Controller('inventory-item')
export class InventoryItemController {

  constructor(
    private readonly service: InventoryItemService,
  ) { }

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

  @Put(':inventory_item_id')
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

  @Get(':inventory_item_id')
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


  @Delete(':inventory_item_id')
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

