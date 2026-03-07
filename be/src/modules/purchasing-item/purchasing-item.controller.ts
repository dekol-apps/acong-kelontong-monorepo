import { Controller, Post, Body, Res, Put, Param, Get, Delete } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseResponse } from 'src/utils/base-response';
import { PurchasingItemService } from './purchasing-item.service';
import type { Response } from 'express';
import { PurchasingItemDto } from './purchasing-item.dto';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

@Controller('purchasing-item')
export class PurchasingItemController {

  constructor(
    private readonly service: PurchasingItemService,
  ) { }

  @Post('')
  async createPurchaseItem(
    @Body() body: PurchasingItemDto,
    @Res() res: Response,
  ) {
    try {
      const purchaseItem = await this.service.createPurchasingItem(body);
      return BaseResponse.success({ res, option: { message: "Success create purchaseItem", detail: purchaseItem } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Put(':purchase_item_id')
  async editPurchaseItem(
    @Param('purchase_item_id') purchaseItemId: Types.ObjectId,
    @Body() body: PurchasingItemDto,
    @Res() res: Response,
  ) {
    try {
      const purchaseItem = await this.service.editPurchasingItem(purchaseItemId, body);
      return BaseResponse.success({ res, option: { message: "Success edit purchaseItem", detail: purchaseItem } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Get(':purchase_item_id')
  async detailPurchaseItem(
    @Param('purchase_item_id') purchaseItemId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const purchaseItem = await this.service.detailPurchasingItem(purchaseItemId);
      return BaseResponse.success({ res, option: { message: "Success get detail purchaseItem", detail: purchaseItem } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Delete(':purchase_item_id')
  async deletePurchaseItem(
    @Param('purchase_item_id') purchaseItemId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const purchaseItem = await this.service.deletePurchasingItem(purchaseItemId);
      return BaseResponse.success({ res, option: { message: "Success delete purchaseItem", detail: purchaseItem } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }
}
