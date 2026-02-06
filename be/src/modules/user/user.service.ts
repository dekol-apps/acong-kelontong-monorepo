import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';
import { salts, sessionDays } from 'src/types/constants';
import { IListRes } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { GlobalService } from 'src/global/global.service';
import { generateRandomToken, addDays, decodeBase64 } from 'src/utils/helper';
import { ChangeEmailDto, ChangePasswordDto, IEditUser, InviteUserDto, TmpUser } from './user.dto';
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
    if (!user.verified) throw BaseResponse.forbidden({ err: 'editUsrPasswd !verified', option: { message: 'User not verified' } });
    const valid = await bcrypt.compare(dto.old_password, user.password);
    if (!valid) throw BaseResponse.invalid({ err: 'editUsrPasswd !valid', option: { message: 'Wrong password' } });
    user.password = await bcrypt.hash(dto.new_password, salts);
    await user.save();
    return user;
  }

  async editUser(user_id: Types.ObjectId, data: IEditUser): Promise<{ user: User, photoToRemove: string }> {
    const {
      first_name,
      last_name,
      user_photo,
      role
    } = data;
    let roleId: Types.ObjectId | undefined = undefined;
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
      let folderPath;
      if (user.user_photo && user.user_photo !== user_photo) {
        const oldPath = new URL(user.user_photo).pathname; // e.g. /uploads/user/photo/<uuid>/<file>
        folderPath = oldPath.split('/').slice(0, -1).join('/'); // remove file name
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
      await user.save();
      return { user, photoToRemove: folderPath };
    } catch (e) {
      throw BaseResponse.unexpected({ err: { text: 'editUser', err: e.message } })
    }
  }

  async editUsrEmailReq(user_id: Types.ObjectId, dto: ChangeEmailDto): Promise<User> {
    const user = await this.userModel.findById(user_id);
    if (!user) throw BaseResponse.notFound({ err: 'editUsrPasswd !user', option: { message: 'User not found' } });
    const exist1 = await this.userModel.exists({ req_change_email: dto.new_email });
    const exist2 = await this.userModel.countDocuments({ email: dto.new_email }) > 1;
    if (exist1 || exist2) {
      throw BaseResponse.forbidden({ err: 'editUsrEmailReq exist' });
    }
    user.req_change_email = dto.new_email;
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
    const searchFields: string[] = ['first_name', 'last_name']; // ✅ Add searchable fields
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

  async resendVerification(user_id: Types.ObjectId): Promise<{ tmpUser: TmpUser, tmpPassword: string }> {
    const tmpUser = await this.userModel.findById(user_id).populate('role').exec();;
    if (!tmpUser) {
      throw BaseResponse.notFound({ err: 'resendVerification tmpUser not found' });
    }
    if (tmpUser.verified) {
      throw BaseResponse.forbidden({ err: 'resendVerification tmpUser already verified' });
    }
    // generate raw random password
    const tmpPassword = generateRandomToken()
    // hash temporary random password
    const password = await bcrypt.hash(tmpPassword, salts);
    tmpUser.password = password;
    tmpUser.verified = false;
    tmpUser.verify_due_time = addDays(new Date(), sessionDays);
    await tmpUser.save();
    return { tmpUser, tmpPassword } as unknown as { tmpUser: TmpUser, tmpPassword: string };
  }

  async inviteUser(body: InviteUserDto): Promise<{ tmpUser: TmpUser, tmpPassword: string }> {
    const findRole = await this.roleService.getDetailRole(body.role) as RoleDocument;
    if (!findRole) throw BaseResponse.notFound({ err: 'inviteUser !findRole' });
    const role = findRole._id;
    const first_name = body.first_name;
    const last_name = body.last_name;
    const email = body.email;
    const exist = await this.userModel.exists({ email });
    if (exist) {
      throw BaseResponse.forbidden({ err: 'inviteUser exist' });
    }
    // generate raw random password
    const tmpPassword = generateRandomToken()
    // hash temporary random password
    const password = await bcrypt.hash(tmpPassword, salts);
    const tmpUser = await this.userModel.create({
      first_name,
      last_name,
      email,
      role,
      password,
      verified: false,
    });

    return { tmpUser, tmpPassword } as unknown as { tmpUser: TmpUser, tmpPassword: string };
  }

  async verifyUser(encryptedTicket: string, newPassword: string): Promise<User> {
    const base64 = decodeBase64(encryptedTicket);
    const ticket = JSON.parse(base64);
    const user = await this.userModel.findById(ticket.pass1);
    console.log('user', user)
    if (!user) throw BaseResponse.notFound({ err: 'verifyUser !user', option: { message: 'User not found' } });
    const valid = await bcrypt.compare(ticket.pass2, user.password);
    if (!valid) throw BaseResponse.invalid({ err: 'verifyUser !valid', option: { message: 'User not found' } });
    user.password = await bcrypt.hash(newPassword, salts);
    user.verified = true;
    await user.save();
    return user;
  }

  async deleteUser(user_id: Types.ObjectId): Promise<User | undefined> {
    const execute = await this.userModel.findById(user_id);
    if (!execute) throw BaseResponse.notFound()
    await this.global.deleteData(execute);
    return execute || undefined;
  }

}
