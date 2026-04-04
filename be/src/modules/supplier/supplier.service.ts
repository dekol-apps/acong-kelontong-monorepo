import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Supplier } from './supplier.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { GlobalService } from 'src/global/global.service';
import { IListRes } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(Supplier.name) private readonly supplierModel: Model<Supplier>,
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService
  ) { }

  async listSupplier({
    page,
    size,
    sortBy,
    sortDir,
    search,
  }: PaginationDto): Promise<IListRes<Supplier>> {
    const searchFields: string[] = ['supplier_name'];

    return this.global.getList<Supplier>(
      this.supplierModel,
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

  async createSupplier(data: Supplier): Promise<Supplier> {
    try {
      const newSupplier = await this.supplierModel.create(data);
      return newSupplier;
    } catch (err) {
      throw BaseResponse.unexpected({ err: { text: 'createSupplier catch', err } })
    }
  }

  async editSupplier(id: Types.ObjectId, data: Supplier): Promise<Supplier | undefined> {
    try {
      const updatedSupplier = await this.supplierModel.findByIdAndUpdate(
        id,
        { $set: data },
        {
          new: true,         // return the updated doc
          runValidators: true, // validate before saving
        },
      ).exec();
      return updatedSupplier || undefined;
    } catch (err) {
      throw BaseResponse.unexpected({ err: { text: 'editSupplier catch', err } })
    }
  }

  async detailSupplier(id: Types.ObjectId): Promise<Supplier | undefined> {
    try {
      const detailSupplier = await this.supplierModel.findById(id).exec();
      return detailSupplier || undefined;
    } catch (err) {
      throw BaseResponse.unexpected({ err: { text: 'detailSupplier catch', err } })
    }
  }

  async deleteSupplier(id: Types.ObjectId): Promise<Supplier | undefined> {
    try {
      const supplier = await this.supplierModel.findById(id);
      if (!supplier) throw BaseResponse.notFound()
      await this.global.deleteData(supplier);
      return supplier || undefined;
    } catch (err) {
      throw BaseResponse.unexpected({ err: { text: 'deleteSupplier catch', err } })
    }
  }
}