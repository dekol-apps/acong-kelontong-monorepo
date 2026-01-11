import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, ClientSession, Connection } from 'mongoose';
import { modules } from 'src/types/constants';
import { IListRes, TOneOrMany } from 'src/types/interfaces';
import { Trash } from './global.schema';
import { Document } from 'mongoose';
import { FilterDto } from './global.dto';
import { BaseResponse } from 'src/utils/base-response';

export type PopulateParam = { column: string; select?: any; match?: any; options?: any };
export class IGetListParam {
  page?: number;
  size?: number;
  sortBy?: string = '';
  sortDir?: 'asc' | 'desc' = 'asc';
  search?: string = '';
  searchFields: string[] = [];
  filter?: TOneOrMany<FilterDto>;
  // allow single or multiple populate options
  populate?: TOneOrMany<PopulateParam>;
}

@Injectable()
export class GlobalService {

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Trash.name) private trashModel: Model<Trash>,
  ) { }


  async getList<M>(model: Model<M>, params: IGetListParam): Promise<IListRes<M>> {
    const pageNum = params.page ? Math.max(1, params.page) : undefined;
    const pageSize = params.size ? Math.max(1, params.size) : undefined;
    const isPaginated = pageNum !== undefined && pageSize !== undefined;
    const skip = isPaginated ? (pageNum - 1) * pageSize : 0;

    // ✅ Start with empty filter object
    const conditions: FilterQuery<M> = {};

    // 🔎 Search
    if (params.search && params.searchFields.length > 0) {
      const conditionList = params.searchFields.map((field: string) => ({
        [field]: { $regex: params.search, $options: 'i' },
      } as FilterQuery<M>));
      conditions['$or'] = conditionList;
    }

    // Flexible filter
    const addFilter = (filter: FilterDto) => {
      if (!filter?.column || filter.value === undefined) return;

      const incomingValues = Array.isArray(filter.value)
        ? filter.value
        : [filter.value];

      if ((conditions as any)[filter.column] !== undefined) {
        const existing = (conditions as any)[filter.column];

        const existingValues =
          existing?.$in ? existing.$in : [existing];

        (conditions as any)[filter.column] = {
          $in: [...existingValues, ...incomingValues],
        };
      } else {
        (conditions as any)[filter.column] =
          incomingValues.length === 1
            ? incomingValues[0]
            : { $in: incomingValues };
      }
    };


    if (params.filter) {
      if (Array.isArray(params.filter)) {
        params.filter.forEach((filter) => {
          addFilter(filter);
        })
      } else {
        addFilter(params.filter);
      }
    }


    // 🔀 Sorting
    const sort: Record<string, 1 | -1> = {};
    if (params.sortBy) {
      sort[params.sortBy] = params.sortDir === 'desc' ? -1 : 1;
    }

    let query = model.find(conditions).sort(sort);

    if (isPaginated) {
      query = query.skip(skip).limit(pageSize);
    }

    // ✅ Handle populate (single or array)
    if (params.populate) {
      if (Array.isArray(params.populate)) {
        params.populate.forEach((pop) => {
          query.populate({ path: pop.column, select: pop.select, match: pop.match, options: pop.options });
        });
      } else {
        query.populate({ path: params.populate.column, select: params.populate.select, match: params.populate.match, options: params.populate.options });
      }
    }

    const total = await model.countDocuments(conditions).exec();

    if (!isPaginated && total > 500) {
      throw BaseResponse.unexpected({ option: { message: 'Pagination is required for large datasets' } });
    }

    const data = await query.exec();

    return {
      data,
      meta: isPaginated ? {
        total,
        page: pageNum,
        size: pageSize,
        totalPages: Math.ceil(total / pageSize),
      } : undefined,
    };
  }

  getPermissions() {
    return modules;
  }

  async withTransaction<T>(
    fn: (session: ClientSession) => Promise<T>,
    sessionIn?: ClientSession
  ): Promise<T> {
    const isNew = !sessionIn;
    const session = sessionIn || await this.connection.startSession();
    if (isNew) session.startTransaction();
    try {
      const result = await fn(session);
      if (isNew) await session.commitTransaction();
      return result;
    } catch (err) {
      if (isNew) await session.abortTransaction();
      await session.endSession();
      throw err;
    } finally {
      if (isNew) await session.endSession();
    }
  }

  async deleteData<T extends Document>(data: T, sessionIn?: ClientSession): Promise<T | undefined> {
    return this.withTransaction(async (session) => {
      await this.trashModel.updateOne(
        { target_id: data._id },
        { $set: { target_data: data.toObject() } },
        { upsert: true },
      ).session(session);
      return await data.deleteOne({ session }); // delete original
    }, sessionIn);
  }

}
