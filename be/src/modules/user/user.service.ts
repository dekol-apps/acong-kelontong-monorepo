import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';
import { salts, sessionDays } from 'src/types/constants';
import { IListRes } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { GlobalService } from 'src/global/global.service';
import { addDays } from 'src/utils/helper';
import { ChangeEmailDto, ChangePasswordDto, IEditUser, InviteUserDto } from './user.dto';
import { RoleService } from '../role/role.service';
import { RoleDocument } from '../role/role.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private roleService: RoleService,
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService
  ) { }


  // Run every work day
  @Cron(CronExpression.EVERY_WEEKDAY)
  async cleanup() {
    await this.expireChangeEmail();
  }

  async expireChangeEmail() {
    const now = new Date();
    await this.userModel.updateMany(
      {
        req_change_email_due_time: { $lt: now },
        req_change_email: { $regex: /@/ },
      },
      { $set: { req_change_email: undefined, req_change_email_due_time: undefined } },
    );
  }

  async getDetailUser(user_id: Types.ObjectId): Promise<User | undefined> {
    const user = await this.userModel.findById(user_id).populate('role').exec();
    return user || undefined;
  }

  async editUsrPasswd(user_id: Types.ObjectId, dto: ChangePasswordDto): Promise<User> {
    const user = await this.userModel.findById(user_id);
    if (!user) throw BaseResponse.notFound({ err: 'editUsrPasswd !user', option: { message: 'User not found' } });
    const valid = await bcrypt.compare(dto.old_password, user.password);
    if (!valid) throw BaseResponse.invalid({ err: 'editUsrPasswd !valid', option: { message: 'Wrong password' } });
    user.password = await bcrypt.hash(dto.new_password, salts);
    await user.save();
    return user;
  }

  async editUser(user_id: Types.ObjectId, data: IEditUser): Promise<{ user: User, photoToRemove: string }> {
    const {
      username,
      email,
      first_name,
      last_name,
      user_photo,
      role,
      password,
    } = data;
    let roleId: Types.ObjectId | undefined = undefined;
    const normalizedUsername = username?.trim().toLowerCase();
    const normalizedEmail = email?.trim().toLowerCase();
    if (role) {
      const findRole = await this.roleService.getDetailRole(role) as RoleDocument;
      if (!findRole) {
        throw BaseResponse.notFound({ err: 'editUser !findRole' });
      }
      roleId = findRole._id as Types.ObjectId;
    }
    try {
      const user = await this.userModel.findById(user_id);
      if (!user) throw BaseResponse.notFound({ err: 'editUser !user', option: { message: 'User not found' } });
      if (normalizedUsername && normalizedUsername !== user.username) {
        const existUsername = await this.userModel.exists({ username: normalizedUsername, _id: { $ne: user_id } });
        if (existUsername) {
          throw BaseResponse.forbidden({ err: 'editUser username exist' });
        }
      }
      if (normalizedEmail && normalizedEmail !== user.email) {
        const existEmail = await this.userModel.exists({ email: normalizedEmail, _id: { $ne: user_id } });
        if (existEmail) {
          throw BaseResponse.forbidden({ err: 'editUser email exist' });
        }
      }
      let folderPath;
      if (user.user_photo && user.user_photo !== user_photo) {
        const oldPath = new URL(user.user_photo).pathname; // e.g. /uploads/user/photo/<uuid>/<file>
        folderPath = oldPath.split('/').slice(0, -1).join('/'); // remove file name
      }
      if (normalizedUsername) {
        user.username = normalizedUsername;
      }
      if (normalizedEmail) {
        user.email = normalizedEmail;
      }
      if (first_name) {
        user.first_name = first_name;
      }
      if (last_name) {
        user.last_name = last_name;
      }
      if (user_photo) {
        user.user_photo = user_photo
      }
      if (roleId) {
        user.role = roleId;
      }
      if (password) {
        user.password = await bcrypt.hash(password, salts);
      }
      await user.save();
      return { user, photoToRemove: folderPath };
    } catch (e) {
      if (e?.statusCode) {
        throw e;
      }
      throw BaseResponse.unexpected({ err: { text: 'editUser', err: e.message } })
    }
  }

  async editUsrEmailReq(user_id: Types.ObjectId, dto: ChangeEmailDto): Promise<User> {
    const user = await this.userModel.findById(user_id);
    if (!user) throw BaseResponse.notFound({ err: 'editUsrPasswd !user', option: { message: 'User not found' } });
    const newEmail = dto.new_email.trim().toLowerCase();
    if (newEmail === user.email) {
      throw BaseResponse.forbidden({ err: 'editUsrEmailReq same email', option: { message: 'New email must be different from current email' } });
    }
    const exist1 = await this.userModel.exists({ req_change_email: newEmail });
    const exist2 = await this.userModel.exists({ email: newEmail, _id: { $ne: user_id } });
    if (exist1 || exist2) {
      throw BaseResponse.forbidden({ err: 'editUsrEmailReq exist' });
    }
    user.req_change_email = newEmail;
    user.req_change_email_due_time = addDays(new Date(), sessionDays);
    await user.save();
    return user;
  }

  async editUsrEmailConfirm(new_email: string): Promise<User> {
    const now = new Date();
    const user = await this.userModel.findOne({ req_change_email: new_email });
    if (!user) throw BaseResponse.notFound({ err: 'editUsrEmailConfirm !user', option: { message: 'User not found' } });
    if (user.req_change_email_due_time && user.req_change_email_due_time <= now) {
      user.req_change_email = undefined;
      user.req_change_email_due_time = undefined;
      await user.save();
      throw BaseResponse.forbidden({ err: 'editUsrEmailConfirm !timeup', option: { message: 'Time expired' } });
    }
    user.req_change_email = undefined;
    user.req_change_email_due_time = undefined;
    user.email = new_email;
    await user.save();
    return user;
  }

  async getListUser(
    page?: number,
    size?: number,
    sortBy?: string,
    sortDir: 'asc' | 'desc' = 'asc',
    search?: string,
    verified?: boolean
  ): Promise<IListRes<User>> {
    const searchFields: string[] = ['username', 'email', 'first_name', 'last_name']; // ✅ Add searchable fields
    const filter = { column: 'verified', value: verified };
    const populate = { column: 'role' };

    return this.global.getList<User>(
      this.userModel,
      {
        page,
        size,
        sortBy,
        sortDir,
        search,
        searchFields,
        filter,
        populate
      }
    )
  }

  async inviteUser(body: InviteUserDto): Promise<User> {
    const findRole = await this.roleService.getDetailRole(body.role) as RoleDocument;
    if (!findRole) throw BaseResponse.notFound({ err: 'inviteUser !findRole' });
    const role = findRole._id;
    const username = body.username.trim().toLowerCase();
    const first_name = body.first_name;
    const last_name = body.last_name;
    const email = body.email.trim().toLowerCase();
    const usernameExist = await this.userModel.exists({ username });
    if (usernameExist) {
      throw BaseResponse.forbidden({ err: 'inviteUser username exist' });
    }
    const exist = await this.userModel.exists({ email });
    if (exist) {
      throw BaseResponse.forbidden({ err: 'inviteUser exist' });
    }
    // initial password is the username
    const hashedPassword = await bcrypt.hash(username, salts);
    const tmpUser = await this.userModel.create({
      username,
      first_name,
      last_name,
      email,
      role,
      password: hashedPassword,
      verified: false,
    });

    return tmpUser;
  }

  async deleteUser(user_id: Types.ObjectId): Promise<User | undefined> {
    const execute = await this.userModel.findById(user_id);
    if (!execute) throw BaseResponse.notFound()
    await this.global.deleteData(execute);
    return execute || undefined;
  }

  async changePasswordViaEmail(email: string, newPassword: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw BaseResponse.notFound({ err: 'changePasswordViaEmail !user', option: { message: 'User not found' } });
    
    user.password = await bcrypt.hash(newPassword, salts);
    await user.save();
    return user;
  }

}
