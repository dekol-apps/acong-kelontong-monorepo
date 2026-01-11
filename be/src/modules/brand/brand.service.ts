import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Brand } from './brand.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseResponse } from 'src/utils/base-response';
import { GlobalService } from 'src/global/global.service';
import { IListRes } from 'src/types/interfaces';
import { PaginationDto } from 'src/global/global.dto';

@Injectable()
export class BrandService {
    constructor(
        @InjectModel(Brand.name) private readonly brandModel: Model<Brand>,
        @Inject(forwardRef(() => GlobalService))
        private global: GlobalService
    ) { }

    async listBrand({
        page,
        size,
        sortBy,
        sortDir,
        search,
    }: PaginationDto): Promise<IListRes<Brand>> {
        const searchFields: string[] = ['brand_name', 'brand_description'];

        return this.global.getList<Brand>(
            this.brandModel,
            {
                page,
                size,
                sortBy,
                sortDir,
                search,
                searchFields,
            }
        )
    }

    async createBrand(data: Brand): Promise<Brand> {
        try {
            const newBrand = await this.brandModel.create(data);
            return newBrand;
        } catch (err) {
            throw BaseResponse.unexpected({ err: { text: 'createBrand catch', err } })
        }
    }

    async editBrand(id: Types.ObjectId, data: Brand): Promise<Brand | undefined> {
        try {
            const updatedBrand = await this.brandModel.findByIdAndUpdate(
                id,
                { $set: data },
                {
                    new: true,         // return the updated doc
                    runValidators: true, // validate before saving
                },
            ).exec();
            return updatedBrand || undefined;
        } catch (err) {
            throw BaseResponse.unexpected({ err: { text: 'editBrand catch', err } })
        }
    }

    async detailBrand(id: Types.ObjectId): Promise<Brand | undefined> {
        try {
            const detailBrand = await this.brandModel.findById(id).exec();
            return detailBrand || undefined;
        } catch (err) {
            throw BaseResponse.unexpected({ err: { text: 'detailBrand catch', err } })
        }
    }

    async deleteBrand(id: Types.ObjectId): Promise<Brand | undefined> {
        try {
            const detailBrand = await this.brandModel.findById(id);
            if (!detailBrand) throw BaseResponse.notFound()
            await this.global.deleteData(detailBrand);
            return detailBrand || undefined;
        } catch (err) {
            throw BaseResponse.unexpected({ err: { text: 'detailBrand catch', err } })
        }
    }
}
