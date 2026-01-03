import { Body, Controller, Get, Param, Put, Query, Res, UseGuards } from '@nestjs/common';
import { PaginationDto } from 'src/global/global.dto';
import { BaseResponse } from 'src/utils/base-response';
import type { Response } from 'express';
import { Types } from 'mongoose';
import { PurchasingEn } from '../purchasing/purchasing.schema';
import { PurchasingService } from '../purchasing/purchasing.service';
import { UAuthGuard } from '../auth/auth.guard';

@UseGuards(UAuthGuard)
@Controller('approval')
export class ApprovalController {
    constructor(
        private readonly service: PurchasingService
    ) { }

    @Get('purchasing')
    async listApprovalPurchasing(
        @Query() query: PaginationDto,
        @Res() res: Response,
    ) {
        try {
            const allowedStat = [PurchasingEn.REQUEST, PurchasingEn.APPROVE, PurchasingEn.REJECT];
            const filter = query.filter && Array.isArray(query.filter) ? query.filter.filter(it => it.value && allowedStat.includes(it.value as PurchasingEn)) : allowedStat.map(it => { return { column: 'status', value: it } })
            const query2 = {
                ...query,
                filter
            }
            const { data, meta } = await this.service.listPurchasing(query2);
            return BaseResponse.success({ res, option: { message: 'Success get list purchasing', list: data, meta } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Put('purchasing/:purchasing_id/approve')
    async purchaseOrderApprove(
        @Param('purchasing_id') purchasingId: Types.ObjectId,
        @Res() res: Response,
    ) {
        try {
            const purchasing = await this.service.purchasingApproval(purchasingId, PurchasingEn.APPROVE);
            return BaseResponse.success({
                res,
                option: { message: `Purchase order approved`, detail: purchasing },
            });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Put('purchasing/:purchasing_id/reject')
    async purchaseOrderReject(
        @Param('purchasing_id') purchasingId: Types.ObjectId,
        @Body() dto: { reject_notes: string },
        @Res() res: Response,
    ) {
        try {
            const purchasing = await this.service.purchasingApproval(purchasingId, PurchasingEn.REJECT, dto.reject_notes);
            return BaseResponse.success({
                res,
                option: { message: `Purchase order rejected`, detail: purchasing },
            });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }
}