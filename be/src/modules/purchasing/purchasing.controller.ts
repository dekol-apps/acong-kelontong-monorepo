import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UploadedFiles, UseGuards } from '@nestjs/common';
import { UAuthGuard } from '../auth/auth.guard';
import { Permission } from 'src/global/permission.decoratior';
import { PaginationDto } from 'src/global/global.dto';
import { BaseResponse } from 'src/utils/base-response';
import { PurchasingService } from './purchasing.service';
import type { Request, Response } from 'express';
import { ListPurchasingDto, PurchasingDto, PurchaseOrderApprovalDto, PurchaseOrderDto } from './purchasing.dto';
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
@UseGuards(UAuthGuard)
@Controller('purchasing')
export class PurchasingController {

  constructor(
    private readonly service: PurchasingService,
  ) { }

  private getUploadDirs(files: Express.Multer.File[] = []): string[] {
    return Array.from(new Set(files.map((file) => file.destination).filter(Boolean)));
  }

  async purchasingMutation<T>(
    args: headerArgs,
    cb: () => Promise<T>,
  ): Promise<T> {
    try {
      if (args.files?.length && args.dto) {
        const existingAttachments = args.dto.purchasing_attachments?.filter(item => typeof item === 'string') ?? [];
        const newAttachements = args.files.map((file) => {
          const normalizedDestination = file.destination.replace(/\\/g, '/');
          return `${args.req.protocol}://${args.req.get('host')}/${normalizedDestination}/${file.filename}`;
        });
        args.dto.purchasing_attachments = [...existingAttachments, ...newAttachements]
      }

      return await cb();
    } catch (err) {
      if (args.files?.length) {
        const dirs = this.getUploadDirs(args.files);
        dirs.forEach((dirPath) => fs.rmSync(dirPath, { recursive: true, force: true }));
      }
      return BaseResponse.error({ res: args.res, err });
    }
  }

  @Permission(['purchasing.create'])
  @Post('')
  @AttachmentsInterceptor('purchasing_attachments', 5)
  async createPurchasing(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: PurchasingDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ files, dto, req, res }, async () => {
      const purchasing = await this.service.createPurchasing(dto);
      return BaseResponse.success({ res, option: { message: "Success create purchasing", detail: purchasing } });
    })
  }

  @Permission(['purchasing.view'])
  @Get('')
  async listPurchasing(
    @Query() query: ListPurchasingDto,
    @Res() res: Response,
  ) {
    try {
      const filter = [
        ...(query.status ? [{ column: 'status', value: query.status }] : []),
        ...(query.payment_status ? [{ column: 'payment_status', value: query.payment_status }] : []),
      ];
      const { data, meta } = await this.service.listPurchasing({ ...query, filter });
      return BaseResponse.success({ res, option: { message: 'Success get list purchasing', list: data, meta } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['purchasing.edit'])
  @Put(':purchasing_id')
  @AttachmentsInterceptor('purchasing_attachments', 5)
  async editPurchasing(
    @Param('purchasing_id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
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

  @Permission(['purchasing.view', 'purchasing_receive.view'])
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

  @Permission(['purchasing.delete'])
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

  @Permission(['purchasing.edit'])
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

  @Permission(['purchasing.edit'])
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

  @Permission(['purchasing.edit'])
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

  @Permission(['purchasing.delete'])
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
        option: { message: `Purchase order dropped`, detail: purchasing },
      });
    });
  }

  @Permission(['purchasing.edit'])
  @Put(':purchasing_id/payment')
  @AttachmentsInterceptor('purchasing_attachments', 5)
  async purchasingPayment(
    @Param('purchasing_id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
    @Body() dto: PurchaseOrderDto,
    @Res() res: Response,
  ) {
    return this.purchasingMutation({ files, dto, req, res }, async () => {
      const purchasingId = new Types.ObjectId(id);
      const { detail, removedAttachments } = await this.service.purchasingPayment(purchasingId, dto);
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

  @Permission(['purchasing_receive.create'])
  @Put(':purchasing_id/receive')
  async recieveOrder(
    @Param('purchasing_id') id: string,
    @Req() req: Request,
    @Body() dto: { invoice_number?: string, receivedItems: ReceiveOrderItemDto[] },
    @Res() res: Response,
  ) {
    try {
      const purchasingId = new Types.ObjectId(id);
      const detail = await this.service.receiveOrder(purchasingId, dto);
      return BaseResponse.success({ res, option: { message: `Purchase order on receive`, detail } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['purchasing.view', 'purchasing_receive.view'])
  @Get(':purchasing_id/items')
  async listPurchasingItem(
    @Query() query: PaginationDto,
    @Param('purchasing_id') purchasingId: string,
    @Res() res: Response,
  ) {
    try {
      const purchasing_id = new Types.ObjectId(purchasingId);
      const { data, meta } = await this.service.listPurchasingItems(purchasing_id, query);
      return BaseResponse.success({ res, option: { message: 'Success get list purchasing item', list: data, meta } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['purchasing.edit'])
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