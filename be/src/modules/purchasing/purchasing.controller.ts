import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UploadedFile } from '@nestjs/common';
import { PaginationDto } from 'src/global/global.dto';
import { BaseResponse } from 'src/utils/base-response';
import { PurchasingService } from './purchasing.service';
import type { Request, Response } from 'express';
import { PurchasingDto, ListPurchasingItemsDTO, PurchaseOrderApprovalDto, PurchaseOrderDto } from './purchasing.dto';
import { Types } from 'mongoose';
import { PurchasingEn } from './purchasing.schema';
import { PurchasingItemDto, ReceiveOrderItemDto } from '../purchasing-item/purchasing-item.dto';
import * as fs from 'fs';
import { AttachmentsInterceptor } from 'src/global/attachments-interceptor';

interface headerArgs {
  purchasingId?: string,
  files?: Express.Multer.File[]
  req: Request,
  dto?: PurchasingDto,
  res: Response,
}
@Controller('purchasing')
export class PurchasingController {

  constructor(
    private readonly service: PurchasingService,
  ) { }

  async purchasingMutation<T>(
    args: headerArgs,
    cb: () => Promise<T>,
  ): Promise<T> {
    try {
      if (args.files?.length && args.dto) {
        const uploadPath = (args.req as any).uploadPath;
        const existingAttachments = args.dto.purchasing_attachments?.filter(item => typeof item === 'string') ?? [];
        const newAttachements = args.files.map((file) => {
          const filePath = `/uploads/${uploadPath}/${file.originalname}`;
          return `${args.req.protocol}://${args.req.get('host')}${filePath}`;
        });
        args.dto.purchasing_attachments = [...existingAttachments, ...newAttachements]
      }

      return await cb();
    } catch (err) {
      if (args.files?.length) {
        const uploadPath = (args.req as any).uploadPath;
        const dirPath = `./uploads/${uploadPath}`;

        fs.rmSync(dirPath, { recursive: true, force: true });
      }
      return BaseResponse.error({ res: args.res, err });
    }
  }

  @Post('')
  @AttachmentsInterceptor('purchasing_attachments', 5)
  async createPurchasing(
    @UploadedFile() files: Express.Multer.File[],
    @Body() dto: PurchasingDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ files, dto, req, res }, async () => {
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
  @AttachmentsInterceptor('purchasing_attachments', 5)
  async editPurchasing(
    @Param('purchasing_id') id: string,
    @UploadedFile() files: Express.Multer.File[],
    @Req() req: Request,
    @Body() dto: PurchasingDto,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ files, dto, req, res }, async () => {
      const purchasingId = new Types.ObjectId(id);
      const { detail, removedAttachments } = await this.service.editPurchasing(purchasingId, dto);
      // delete old files AFTER DB success
      removedAttachments.forEach((url) => {
        try {
          const pathname = new URL(url).pathname;
          fs.rmSync(`.${pathname}`, { force: true });
        } catch (e) {
          console.warn('Failed to remove attachment:', url);
        }
      });
      return BaseResponse.success({
        res,
        option: { message: 'Success edit purchasing', detail },
      });
    })
  }

  @Get(':purchasing_id')
  async detailPurchasing(
    @Param('purchasing_id') id: string,
    @Res() res: Response,
  ) {
    try {
      const purchasingId = new Types.ObjectId(id);
      const purchasing = await this.service.detailPurchasing(purchasingId);
      return BaseResponse.success({ res, option: { message: "Success get detail purchasing", detail: purchasing } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Delete(':purchasing_id')
  async deletePurchasing(
    @Param('purchasing_id') id: string,
    @Res() res: Response,
  ) {
    try {
      const purchasingId = new Types.ObjectId(id);
      const { detail, removedAttachments } = await this.service.deletePurchasing(purchasingId);
      // delete old files AFTER DB success
      removedAttachments.forEach((url) => {
        try {
          const pathname = new URL(url).pathname;
          fs.rmSync(`.${pathname}`, { force: true });
        } catch (e) {
          console.warn('Failed to remove attachment:', url);
        }
      });
      return BaseResponse.success({ res, option: { message: "Success get detail purchasing", detail } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Put(':purchasing_id/request')
  async purchaseOrder(
    @Param('purchasing_id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ req, res }, async () => {
      const purchasingId = new Types.ObjectId(id);
      const purchasing = await this.service.purchaseOrder(purchasingId);
      return BaseResponse.success({
        res,
        option: { message: `Purchase order on approval`, detail: purchasing },
      });
    });
  }

  @Put(':purchasing_id/approval')
  async purchaseOrderApproval(
    @Param('purchasing_id') id: string,
    @Req() req: Request,
    @Body() dto: PurchaseOrderApprovalDto,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ req, res }, async () => {
      const purchasingId = new Types.ObjectId(id);
      const purchasing = await this.service.purchasingApproval(purchasingId, dto);
      return BaseResponse.success({
        res,
        option: { message: `Purchase order success ${dto.approval}`, detail: purchasing },
      });
    });
  }

  @Put(':purchasing_id/process')
  async purchaseOrderProcess(
    @Param('purchasing_id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ req, res }, async () => {
      const purchasingId = new Types.ObjectId(id);
      const purchasing = await this.service.purchasingExecute(purchasingId);
      return BaseResponse.success({
        res,
        option: { message: `Purchase order on process`, detail: purchasing },
      });
    });
  }

  @Put(':purchasing_id/drop')
  async purchaseOrderDrop(
    @Param('purchasing_id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ req, res }, async () => {
      const purchasingId = new Types.ObjectId(id);
      const purchasing = await this.service.purchasingDrop(purchasingId, PurchasingEn.DROP);
      return BaseResponse.success({
        res,
        option: { message: `Purchase order on process`, detail: purchasing },
      });
    });
  }

  @Put(':purchasing_id/payment')
  @AttachmentsInterceptor('purchasing_attachments', 5)
  async purchasingPayment(
    @Param('purchasing_id') id: string,
    @UploadedFile() files: Express.Multer.File[],
    @Req() req: Request,
    @Body() dto: PurchaseOrderDto,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ files, dto, req, res }, async () => {
      const purchasingId = new Types.ObjectId(id);
      const { detail, removedAttachments } = await this.service.editPurchasing(purchasingId, dto);
      // delete old files AFTER DB success
      removedAttachments.forEach((url) => {
        try {
          const pathname = new URL(url).pathname;
          fs.rmSync(`.${pathname}`, { force: true });
        } catch (e) {
          console.warn('Failed to remove attachment:', url);
        }
      });
      return BaseResponse.success({
        res,
        option: { message: 'Success update purchasing data', detail },
      });
    })
  }


  @Put(':purchasing_id/receive')
  @AttachmentsInterceptor('purchasing_attachments', 5)
  async recieveOrder(
    @Param('purchasing_id') id: string,
    @UploadedFile() files: Express.Multer.File[],
    @Req() req: Request,
    @Body() dto: { purchase: PurchaseOrderDto, purhcaseItems: ReceiveOrderItemDto[] },
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ files, dto: dto.purchase, req, res }, async () => {
      const purchasingId = new Types.ObjectId(id);
      const data: PurchaseOrderDto & { status: PurchasingEn } = {
        ...dto.purchase,
        status: PurchasingEn.RECEIVE
      }
      const { detail, removedAttachments } = await this.service.receiveOrder(purchasingId, data, dto.purhcaseItems);
      // delete old files AFTER DB success
      removedAttachments.forEach((url) => {
        try {
          const pathname = new URL(url).pathname;
          fs.rmSync(`.${pathname}`, { force: true });
        } catch (e) {
          console.warn('Failed to remove attachment:', url);
        }
      });
      return BaseResponse.success({
        res,
        option: { message: `Purchase order on receive`, detail },
      });
    });
  }

  @Get(':purchasing_id/items')
  async listPurchasingItem(
    @Query() query: ListPurchasingItemsDTO,
    @Param('purchasing_id') purchasingId: string,
    @Res() res: Response,
  ) {
    try {
      if (!query.purchasing_id) query.purchasing_id = new Types.ObjectId(purchasingId);
      const { data, meta } = await this.service.listPurchasingItems(query);
      return BaseResponse.success({ res, option: { message: 'Success get list purchasing item', list: data, meta } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Post(':purchasing_id/items')
  async purchasingItemBulkUpdate(
    @Body() body: PurchasingItemDto[],
    @Param('purchasing_id') id: string,
    @Res() res: Response,
  ) {
    try {
      const purchasingId = new Types.ObjectId(id);
      const data = await this.service.bulkUpdatePurchasingItems(purchasingId, body);
      return BaseResponse.success({ res, option: { message: 'Success bulk update purchasing item', list: data } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }
}