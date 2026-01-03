import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PaginationDto } from 'src/global/global.dto';
import { BaseResponse } from 'src/utils/base-response';
import { PurchasingService } from './purchasing.service';
import type { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { PurchasingDto, PurchaseOrderDto, ListPurchasingItemsDTO, ReceiveOrderDto } from './purchasing.dto';
import { Types } from 'mongoose';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { PurchasingEn } from './purchasing.schema';
import { PurchasingItemDto } from '../purchasing-item/purchasing-item.dto';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { UploadInvoiceInterceptor } from './purchasing-invoice.interceptor';

interface headerArgs {
  purchasingId?: Types.ObjectId,
  file?: Express.Multer.File,
  req: Request,
  dto?: PurchasingDto,
  res: Response,
}
@Controller('purchasing')
export class PurchasingController {

  constructor(
    private readonly service: PurchasingService,
  ) { }

  async purchasingMutation<T>(args: headerArgs, cb: () => Promise<T>): Promise<T> {
    try {
      if (args.file && args.dto) {
        const folder = (args.req as any).uuidFolder;
        const filePath = `/uploads/invoices/${folder}/${args.file.filename}`;
        const fullUrl = `${args.req.protocol}://${args.req.get('host')}${filePath}`;
        args.dto.invoice_photo = fullUrl;
      }
      const result = await cb();
      return result;
    } catch (err) {
      if (args.file) {
        const folder = (args.req as any).uuidFolder;
        const filePath = `/uploads/invoices/${folder}/`;
        fs.rmSync(`.${filePath}`, { recursive: true, force: true });
      }
      return BaseResponse.error({ res: args.res, err });
    }
  }

  @Post('')
  @UploadInvoiceInterceptor()
  async createPurchasing(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: PurchasingDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ file, dto, req, res }, async () => {
      const data: PurchasingDto & { status: PurchasingEn } = {
        ...dto,
        status: PurchasingEn.CREATE
      }
      const purchasing = await this.service.createPurchasing(data);
      return BaseResponse.success({ res, option: { message: "Success create purchasing", detail: purchasing } });
    })
  }

  @Get('')
  async listPurchasing(
    @Query() query: PaginationDto,
    @Res() res: Response,
  ) {
    try {
      const { data, meta } = await this.service.listPurchasing(query);
      return BaseResponse.success({ res, option: { message: 'Success get list purchasing', list: data, meta } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Put(':purchasing_id')
  @UploadInvoiceInterceptor()
  async editPurchasing(
    @Param('purchasing_id') purchasingId: Types.ObjectId,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Body() dto: PurchasingDto,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ file, dto, req, res }, async () => {
      const purchasing = await this.service.editPurchasing(purchasingId, dto);
      return BaseResponse.success({
        res,
        option: { message: 'Success edit purchasing', detail: purchasing },
      });
    })
  }

  @Get(':purchasing_id')
  async detailPurchasing(
    @Param('purchasing_id') purchasingId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const purchasing = await this.service.detailPurchasing(purchasingId);
      return BaseResponse.success({ res, option: { message: "Success get detail purchasing", detail: purchasing } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Delete(':purchasing_id')
  async deletePurchasing(
    @Param('purchasing_id') purchasingId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const purchasing = await this.service.deletePurchasing(purchasingId);
      return BaseResponse.success({ res, option: { message: "Success get detail purchasing", detail: purchasing } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Put(':purchasing_id/request')
  async purchaseOrder(
    @Param('purchasing_id') purchasingId: Types.ObjectId,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ req, res }, async () => {
      const purchasing = await this.service.purchaseOrder(purchasingId);
      return BaseResponse.success({
        res,
        option: { message: `Purchase order on approval`, detail: purchasing },
      });
    });
  }

  @Put(':purchasing_id/approve')
  async purchaseOrderApprove(
    @Param('purchasing_id') purchasingId: Types.ObjectId,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ req, res }, async () => {
      const purchasing = await this.service.purchasingUpdateStat(purchasingId, PurchasingEn.APPROVE);
      return BaseResponse.success({
        res,
        option: { message: `Purchase order approved`, detail: purchasing },
      });
    });
  }

  @Put(':purchasing_id/reject')
  async purchaseOrderReject(
    @Param('purchasing_id') purchasingId: Types.ObjectId,
    @Req() req: Request,
    @Body() dto: { reject_notes: string },
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ req, res }, async () => {
      const purchasing = await this.service.purchasingUpdateStat(purchasingId, PurchasingEn.REJECT, dto.reject_notes);
      return BaseResponse.success({
        res,
        option: { message: `Purchase order rejected`, detail: purchasing },
      });
    });
  }

  @Put(':purchasing_id/process')
  async purchaseOrderProcess(
    @Param('purchasing_id') purchasingId: Types.ObjectId,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ req, res }, async () => {
      const purchasing = await this.service.purchasingUpdateStat(purchasingId, PurchasingEn.PROCESS);
      return BaseResponse.success({
        res,
        option: { message: `Purchase order on process`, detail: purchasing },
      });
    });
  }

  @Put(':purchasing_id/drop')
  async purchaseOrderDrop(
    @Param('purchasing_id') purchasingId: Types.ObjectId,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ req, res }, async () => {
      const purchasing = await this.service.purchasingUpdateStat(purchasingId, PurchasingEn.DROP);
      return BaseResponse.success({
        res,
        option: { message: `Purchase order on process`, detail: purchasing },
      });
    });
  }

  @Put(':purchasing_id/receive')
  @UploadInvoiceInterceptor()
  async recieveOrder(
    @Param('purchasing_id') purchasingId: Types.ObjectId,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Body() dto: { purchase: ReceiveOrderDto, purhcaseItems: PurchasingItemDto[] },
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ file, dto: dto.purchase, req, res }, async () => {
      const data: ReceiveOrderDto & { status: PurchasingEn } = {
        ...dto.purchase,
        status: PurchasingEn.RECEIVE
      }
      const purchasing = await this.service.receiveOrder(purchasingId, data, dto.purhcaseItems);
      return BaseResponse.success({
        res,
        option: { message: `Purchase order on receive`, detail: purchasing },
      });
    });
  }

  @Get(':purchasing_id/items')
  async listPurchasingItem(
    @Query() query: ListPurchasingItemsDTO,
    @Param('purchasing_id') purchasingId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      query.purchasing_id = purchasingId;
      const { data, meta } = await this.service.listPurchasingItems(query);
      return BaseResponse.success({ res, option: { message: 'Success get list purchasing item', list: data, meta } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Post(':purchasing_id/items')
  async purchasingItemBulkUpdate(
    @Body() body: PurchasingItemDto[],
    @Param('purchasing_id') purchasingId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const data = await this.service.bulkUpdatePurchasingItems(purchasingId, body);
      return BaseResponse.success({ res, option: { message: 'Success bulk update purchasing item', list: data } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }
}