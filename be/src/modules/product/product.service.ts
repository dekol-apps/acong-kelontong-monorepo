import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { GlobalService, PopulateParam } from 'src/global/global.service';
import { IListRes } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { Product } from './product.schema';
import { CreateProductDto, UpdateProductDto } from './product.dto';

@Injectable()
export class ProductService {

  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService
  ) { }

  async listProduct({
    page,
    size,
    sortBy,
    sortDir,
    search,
  }: PaginationDto): Promise<IListRes<Product>> {
    const searchFields: string[] = ['product_name', 'product_description', 'barcode', 'brand.brand_name'];
    const populate: PopulateParam = { column: 'brand' }

    return this.global.getList<Product>(
      this.productModel,
      {
        page,
        size,
        sortBy,
        sortDir,
        search,
        searchFields,
        populate
      }
    )
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    try {
      const dataToSave = { ...data };
      const newProduct = await this.productModel.create(dataToSave);
      return newProduct;
    } catch (err) {
      throw BaseResponse.unexpected({ err: { text: 'createProduct catch', err } })
    }
  }

  async editProduct(id: Types.ObjectId, data: UpdateProductDto): Promise<Product | undefined> {
    try {
      const dataToUpdate: any = { ...data };
      const updatedProduct = await this.productModel.findByIdAndUpdate(
        id,
        { $set: dataToUpdate },
        {
          new: true,         // return the updated doc
          runValidators: true, // validate before saving
        },
      ).exec();
      return updatedProduct || undefined;
    } catch (err) {
      throw BaseResponse.unexpected({ err: { text: 'editProduct catch', err } })
    }
  }

  async detailProduct(id: Types.ObjectId): Promise<Product | undefined> {
    try {
      const detailProduct = await this.productModel.findById(id).exec();
      return detailProduct || undefined;
    } catch (err) {
      throw BaseResponse.unexpected({ err: { text: 'detailProduct catch', err } })
    }
  }

  async deleteProduct(id: Types.ObjectId): Promise<Product | undefined> {
    try {
      const product = await this.productModel.findById(id);
      if (!product) throw BaseResponse.notFound()
      await this.global.deleteData(product);
      return product || undefined;
    } catch (err) {
      throw BaseResponse.unexpected({ err: { text: 'deleteProduct catch', err } })
    }
  }
}
