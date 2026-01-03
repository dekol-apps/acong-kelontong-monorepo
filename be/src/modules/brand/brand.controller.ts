import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { UAuthGuard } from '../auth/auth.guard';
import { Brand } from './brand.schema';
import { BrandService } from './brand.service';
import type { Response } from 'express';
import { BaseResponse } from 'src/utils/base-response';
import { PaginationDto } from 'src/global/global.dto';
import { Types } from 'mongoose';

@UseGuards(UAuthGuard)
@Controller('brand')
export class BrandController {
    constructor(
        private readonly service: BrandService,
    ) { }

    @Post('')
    async createBrand(
        @Body() body: Brand,
        @Res() res: Response,
    ) {
        try {
            const brand = await this.service.createBrand(body);
            return BaseResponse.success({ res, option: { message: "Success create brand", detail: brand } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Get('')
    async listBrand(
        @Query() query: PaginationDto,
        @Res() res: Response,
    ) {
        try {
            const { data, meta } = await this.service.listBrand(query);
            return BaseResponse.success({ res, option: { message: 'Success get list brand', list: data, meta } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Put(':brand_id')
    async editBrand(
        @Param('brand_id') brandId: Types.ObjectId,
        @Body() body: Brand,
        @Res() res: Response,
    ) {
        try {
            const brand = await this.service.editBrand(brandId, body);
            return BaseResponse.success({ res, option: { message: "Success edit brand", detail: brand } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Get(':brand_id')
    async detailBrand(
        @Param('brand_id') brandId: Types.ObjectId,
        @Res() res: Response,
    ) {
        try {
            const brand = await this.service.detailBrand(brandId);
            return BaseResponse.success({ res, option: { message: "Success get detail brand", detail: brand } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }


    @Delete(':brand_id')
    async deleteBrand(
        @Param('brand_id') brandId: Types.ObjectId,
        @Res() res: Response,
    ) {
        try {
            const brand = await this.service.deleteBrand(brandId);
            return BaseResponse.success({ res, option: { message: "Success get detail brand", detail: brand } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }
}
