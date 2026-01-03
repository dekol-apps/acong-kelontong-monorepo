import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, ClientSession, Connection } from 'mongoose';
import { modules } from 'src/types/constants';
import { IPaginationRes, TOneOrMany } from 'src/types/interfaces';
import { Trash } from './global.schema';
import { Document } from 'mongoose';
import { FilterDto } from './global.dto';

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


  async getList<M>(model: Model<M>, params: IGetListParam): Promise<{ data: M[]; meta: IPaginationRes }> {
    const pageNum = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.max(1, Number(params.size) || 1000);
    const skip = (pageNum - 1) * pageSize;

    // ✅ Start with empty filter object
    const conditions: FilterQuery<M> = {};

    // 🔎 Search
    if (params.search && params.searchFields.length > 0) {
      const conditionList = params.searchFields.map((field: any) => ({
        [field]: { $regex: params.search, $options: 'i' },
      }));
      conditions['$or'] = conditionList;
    }

    // Flexible filter
    const addFilter = (filter) => {
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

    const query = model.find(conditions).sort(sort).skip(skip).limit(pageSize);

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

    const [data, total] = await Promise.all([
      query.exec(),
      model.countDocuments(conditions).exec(),
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNum,
        size: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
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
