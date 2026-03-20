import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { UAuthGuard } from '../auth/auth.guard';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { ProductService } from './product.service';
import type { Response } from 'express';
import { BaseResponse } from 'src/utils/base-response';
import { PaginationDto } from 'src/global/global.dto';
import { Types } from 'mongoose';
import { Permission } from 'src/global/permission.decoratior';

@UseGuards(UAuthGuard)
@Controller('product')
export class ProductController {
    constructor(
        private readonly service: ProductService,
    ) { }

    @Permission(['product.create'])
    @Post('')
    async createProduct(
        @Body() body: CreateProductDto,
        @Res() res: Response,
    ) {
        try {
            const product = await this.service.createProduct(body);
            return BaseResponse.success({ res, option: { message: "Success create product", detail: product } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Permission(['product.view'])
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

    @Permission(['product.edit'])
    @Put(':product_id')
    async editProduct(
        @Param('product_id') productId: Types.ObjectId,
        @Body() body: UpdateProductDto,
        @Res() res: Response,
    ) {
        try {
            const product = await this.service.editProduct(productId, body);
            return BaseResponse.success({ res, option: { message: "Success edit product", detail: product } });
        } catch (err) {
            return BaseResponse.error({ res, err });
        }
    }

    @Permission(['product.view'])
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


    @Permission(['product.delete'])
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
