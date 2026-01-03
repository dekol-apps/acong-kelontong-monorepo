import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Approval } from './approval.schema';
import type { Response } from 'express';
import { BaseResponse } from 'src/utils/base-response';
import { PaginationDto } from 'src/global/global.dto';
import { Types } from 'mongoose';
import { ApprovalService } from './approval.service';

@UseGuards(AuthGuard)
@Controller('approval')
export class ApprovalController {
    constructor(
        private readonly service: ApprovalService,
    ) { }

    @Post('')
    async createApproval(
        @Body() body: Approval,
        @Res() res: Response,
    ) {
        try {
            const approval = await this.service.createApproval(body);
            return BaseResponse.success({ res, option: { message: "Success create approval", detail: approval } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Get('')
    async listApproval(
        @Query() query: PaginationDto,
        @Res() res: Response,
    ) {
        try {
            const { data, meta } = await this.service.listApproval(query);
            return BaseResponse.success({ res, option: { message: 'Success get list approval', list: data, meta } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Put(':approval_id')
    async editApproval(
        @Param('approval_id') approvalId: Types.ObjectId,
        @Body() body: Approval,
        @Res() res: Response,
    ) {
        try {
            const approval = await this.service.editApproval(approvalId, body);
            return BaseResponse.success({ res, option: { message: "Success edit approval", detail: approval } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Get(':approval_id')
    async detailApproval(
        @Param('approval_id') approvalId: Types.ObjectId,
        @Res() res: Response,
    ) {
        try {
            const approval = await this.service.detailApproval(approvalId);
            return BaseResponse.success({ res, option: { message: "Success get detail approval", detail: approval } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }


    @Delete(':approval_id')
    async deleteApproval(
        @Param('approval_id') approvalId: Types.ObjectId,
        @Res() res: Response,
    ) {
        try {
            const approval = await this.service.deleteApproval(approvalId);
            return BaseResponse.success({ res, option: { message: "Success get detail approval", detail: approval } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }
}
