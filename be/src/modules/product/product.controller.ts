import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { UAuthGuard } from '../auth/auth.guard';
import { Product } from './product.schema';
import { ProductService } from './product.service';
import type { Response } from 'express';
import { BaseResponse } from 'src/utils/base-response';
import { PaginationDto } from 'src/global/global.dto';
import { Types } from 'mongoose';

@UseGuards(UAuthGuard)
@Controller('product')
export class ProductController {
    constructor(
        private readonly service: ProductService,
    ) { }

    @Post('')
    async createProduct(
        @Body() body: Product,
        @Res() res: Response,
    ) {
        try {
            const product = await this.service.createProduct(body);
            return BaseResponse.success({ res, option: { message: "Success create product", detail: product } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Get('')
    async listProduct(
        @Query() query: PaginationDto,
        @Res() res: Response,
    ) {
        try {
            const { data, meta } = await this.service.listProduct(query);
            return BaseResponse.success({ res, option: { message: 'Success get list product', list: data, meta } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Put(':product_id')
    async editProduct(
        @Param('product_id') productId: Types.ObjectId,
        @Body() body: Product,
        @Res() res: Response,
    ) {
        try {
            const product = await this.service.editProduct(productId, body);
            return BaseResponse.success({ res, option: { message: "Success edit product", detail: product } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Get(':product_id')
    async detailProduct(
        @Param('product_id') productId: Types.ObjectId,
        @Res() res: Response,
    ) {
        try {
            const product = await this.service.detailProduct(productId);
            return BaseResponse.success({ res, option: { message: "Success get detail product", detail: product } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }


    @Delete(':product_id')
    async deleteProduct(
        @Param('product_id') productId: Types.ObjectId,
        @Res() res: Response,
    ) {
        try {
            const product = await this.service.deleteProduct(productId);
            return BaseResponse.success({ res, option: { message: "Success get detail product", detail: product } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }
}
