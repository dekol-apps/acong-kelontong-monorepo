import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Role } from './role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { IListRes, TModules } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';

type RoleUpsertPayload = {
  role_name: string;
  modules: TModules[];
  active?: boolean;
};

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService
  ) { }

  async getListRole(
    page?: number,
    size?: number,
    sortBy?: string,
    sortDir: 'asc' | 'desc' = 'asc',
    search?: string,
    active?: boolean
  ): Promise<IListRes<Role>> {
    const searchFields: string[] = ['role_name'];
    let filter: { column: string; value: boolean } | undefined;
    if (active) {
      filter = { column: 'active', value: true }
    }

    return this.global.getList<Role>(
      this.roleModel,
      {
        page,
        size,
        sortBy,
        sortDir,
        search,
        filter,
        searchFields,
      }
    )
  }

  async createRole(body: RoleUpsertPayload): Promise<Role> {
    const role_name = body.role_name;
    const modules = body.modules;

    const exist = await this.roleModel.findOne({ role_name });
    if (exist) {
      throw BaseResponse.forbidden({ err: 'createRole exist' });
    }
    const newRole = await this.roleModel.create({
      role_name,
      modules
    });
    return newRole;
  }

  async getDetailRole(role_id: Types.ObjectId): Promise<Role | undefined> {
    const role = await this.roleModel.findById(role_id);
    return role || undefined;
  }

  async editRole(role_id: Types.ObjectId, data: RoleUpsertPayload): Promise<Role | undefined> {
    const {
      role_name,
      modules,
      active
    } = data;
    try {
      const uptatedRole = await this.roleModel.findByIdAndUpdate(
        role_id,
        {
          $set: {
            role_name,
            modules,
            active
          }
        },
        {
          new: true,         // return the updated doc
          runValidators: true, // validate before saving
        },
      ).exec();
      return uptatedRole || undefined;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      throw BaseResponse.unexpected({ err: { text: 'editRole', err: message } })
    }
  }

  async deleteRole(role_id: Types.ObjectId): Promise<Role | undefined> {
    const role = await this.roleModel.findById(role_id);
    if (!role) throw BaseResponse.notFound({ option: { message: 'Role not found' } })
    if (role.active) throw BaseResponse.forbidden({ option: { message: 'Cannot delete active role' } })
    await this.global.deleteData(role);
    return role || undefined;
  }
}
