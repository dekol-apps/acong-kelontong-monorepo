import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UploadedFile, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UAuthGuard } from '../auth/auth.guard';
import { BaseResponse } from 'src/utils/base-response';
import type { Request, Response } from 'express';
import { InviteUserDto, GetUserListDto, IEditUser, ChangePasswordDto } from './user.dto';
import * as jwt from 'jsonwebtoken';
import { MailerService } from '@nestjs-modules/mailer';
import { Permission } from 'src/global/permission.decoratior';
import { Types } from 'mongoose';
import { UploadUserPhotoInterceptor } from './user-photo.interceptor';
import { sessionDays } from 'src/types/constants';
import * as fs from 'fs';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailerService
  ) { }

  @UseGuards(UAuthGuard)
  @Permission(['user.view'])
  @Get('')
  async list(
    @Query() { page, size, sortBy, sortDir, search, verified }: GetUserListDto,
    @Res() res: Response,
  ) {
    try {
      const { data, meta } = await this.userService.getListUser(page, size, sortBy, sortDir, search, verified);
      return BaseResponse.success({
        res,
        option: { message: 'Success get list user', list: data, meta },
      });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @UseGuards(UAuthGuard)
  @Permission(['user.create'])
  @Post('')
  async inviteUser(
    @Body() body: InviteUserDto,
    @Res() res: Response,
  ) {
    try {
      const user = await this.userService.inviteUser(body)
      if (!user) throw BaseResponse.forbidden({ option: { message: 'User Exist' } })
      
      // Generate JWT token for password change link
      const payload = { email: user.email, type: 'pwd_change' };
      const invitationToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: sessionDays + 'd' });
      const linkChangePassword = `${process.env.FE_DOMAIN}/${process.env.URL_CHANGE_PASSWORD as string}/${invitationToken}`;
      
      const mailOptions = {
        from: `"Acong Kelontong" <${process.env.SMTP_USER as string}>`,
        to: user.email,
        subject: "Your Account Has Been Created",
        html: `Hello <b>${user.first_name}</b>! <br/><br/>Your account has been created. You can now login with the following credentials:<br/><br/>Username: ${user.username}<br/>Initial password: <code>${user.username}</code><br/><br/>You have two options:<br/>1. Login directly with your username and password<br/>2. <a href="${linkChangePassword}">Click here to set a new password</a> (expires in ${sessionDays} days)<br/><br/>Regards,<br/>Acong Kelontong`,
      };
      this.mailerService
        .sendMail({
          ...mailOptions,
        })
        .then((res) => {
          console.info("Email sent: " + JSON.stringify(res))
        })
        .catch((err) => {
          console.error(err)
        });
      return BaseResponse.success({ res, option: { message: "Success to create user", detail: user } });
    }
    catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @UseGuards(UAuthGuard)
  @Permission(['user.view'])
  @Get('detail/:user_id')
  async detail(
    @Param('user_id') user_id: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const detail = await this.userService.getDetailUser(user_id);
      return BaseResponse.success({
        res,
        option: { message: 'Success get detail user', detail },
      });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @UseGuards(UAuthGuard)
  @Permission(['user.edit'])
  @Put('detail/:user_id')
  @UploadUserPhotoInterceptor()
  async editProfile(
    @Param('user_id') user_id: Types.ObjectId,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: IEditUser,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (file && body) {
        const folder = (req as any).uuidFolder;
        const filePath = `/uploads/users/photo/${folder}/${file.filename}`;
        const fullUrl = `${req.protocol}://${req.get('host')}${filePath}`;
        body.user_photo = fullUrl;
      }
      const { user, photoToRemove } = await this.userService.editUser(user_id, body);
      if (photoToRemove) {
        try {
          fs.rmSync(`.${photoToRemove}`, { recursive: true, force: true }); // delete the UUID folder
        } catch (err) {
          console.warn('Failed to delete old user photo:', err.message);
        }
      }
      return BaseResponse.success({ res, option: { message: 'Success edit user', detail: user } })
    } catch (err) {
      if (file) {
        const folder = (req as any).uuidFolder;
        const filePath = `/uploads/users/photo/${folder}/`;
        fs.rmSync(`.${filePath}`, { recursive: true, force: true });
      }
      return BaseResponse.error({ res, err });
    }
  }

  @UseGuards(UAuthGuard)
  @Permission(['user.delete'])
  @Delete('detail/:user_id')
  async deleteUser(
    @Param('user_id') user_id: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const detail = await this.userService.deleteUser(user_id);
      return BaseResponse.success({ res, option: { message: 'Success edit user', detail } })
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @UseGuards(UAuthGuard)
  @Permission(['user.create', 'user.edit'])
  @Put('detail/:user_id/role')
  async editRole(
    @Param('user_id') user_id: Types.ObjectId,
    @Body() body: {
      role: Types.ObjectId;
    },
    @Res() res: Response,
  ) {
    try {
      const { user } = await this.userService.editUser(user_id, body);
      return BaseResponse.success({ res, option: { message: 'Success edit user', detail: user } })
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @UseGuards(UAuthGuard)
  @Permission(['user.edit'])
  @Put('detail/:user_id/change-password')
  async changePassword(
    @Param('user_id') user_id: Types.ObjectId,
    @Body() body: ChangePasswordDto,
    @Res() res: Response,
  ) {
    try {
      const detail = await this.userService.editUsrPasswd(user_id, body);
      return BaseResponse.success({ res, option: { message: 'Success change password', detail } })
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

}
