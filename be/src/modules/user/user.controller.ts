import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UploadedFile, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UAuthGuard } from '../auth/auth.guard';
import { BaseResponse } from 'src/utils/base-response';
import type { Request, Response } from 'express';
import { ChangeEmailDto, ChangePasswordDto, GetUserListDto, IEditUser, InviteUserDto } from './user.dto';
import { decodeBase64, encodeBase64 } from 'src/utils/helper';
import { MailerService } from '@nestjs-modules/mailer';
import { Permission } from 'src/global/permission.decoratior';
import { Types } from 'mongoose';
import { UploadUserPhotoInterceptor } from './user-photo.interceptor';
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
      const invite = await this.userService.inviteUser(body)
      if (!invite) throw BaseResponse.forbidden({ option: { message: 'User Exist' } })
      const ticket = { pass1: invite.tmpUser._id, pass2: invite.tmpPassword }
      const base64 = encodeBase64(JSON.stringify(ticket))
      const linkChangePassword = `${process.env.FE_DOMAIN}/${process.env.URL_CHANGE_PASSWORD as string}/${base64}?type=password`;
      const mailOptions = {
        from: `"Acong Kelontong" <${process.env.SMTP_USER as string}>`,
        to: invite.tmpUser.email,
        subject: "Verify Account",
        html: `Hello <b>${invite.tmpUser.first_name}</b>! \nPlease click the link below to verify your account: \n${linkChangePassword}`,
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
      return BaseResponse.success({ res, option: { message: "Success to invite user", detail: { url: linkChangePassword } } });
    }
    catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @UseGuards(UAuthGuard)
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
  @Post('detail/:user_id/re-invite')
  async resendVerification(
    @Param('user_id') user_id: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const invite = await this.userService.resendVerification(user_id)
      const ticket = { pass1: invite.tmpUser._id, pass2: invite.tmpPassword }
      const base64 = encodeBase64(JSON.stringify(ticket))
      const linkChangePassword = `${process.env.FE_DOMAIN}/${process.env.URL_CHANGE_PASSWORD as string}/${base64}?type=password`;
      const mailOptions = {
        from: `"Acong Kelontong <No Reply>" <${process.env.SMTP_USER as string}>`,
        to: invite.tmpUser.email,
        subject: "Verify Account",
        html: `Hello <b>${invite.tmpUser.first_name}</b>! \nPlease click the link below to verify your account: \n${linkChangePassword}`,
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
      return BaseResponse.success({ res, option: { message: "Success to resend verification", detail: { url: linkChangePassword } } });
    }
    catch (err) {
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


  @UseGuards(UAuthGuard)
  @Permission(['user.edit'])
  @Put('detail/:user_id/change-email-request')
  async changeEmail(
    @Param('user_id') user_id: Types.ObjectId,
    @Body() body: ChangeEmailDto,
    @Res() res: Response,
  ) {
    try {
      const detail = await this.userService.editUsrEmailReq(user_id, body);
      if (!detail.req_change_email) throw BaseResponse.unexpected({ err: 'changeEmail !detail.req_change_email' });
      const base64 = encodeBase64(detail.req_change_email)
      const linkChangePassword = `${process.env.FE_DOMAIN}/${process.env.URL_CHANGE_PASSWORD as string}/${base64}?type=email`;
      const mailOptions = {
        from: `"Acong Kelontong <No Reply>" <${process.env.SMTP_USER as string}>`,
        to: detail.req_change_email,
        subject: "Verify New Email",
        html: `Hello <b>${detail.first_name}</b>! \nPlease click the link below to verify your new email: \n${linkChangePassword}`,
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
      return BaseResponse.success({ res, option: { message: 'Verification email sent', detail } })
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Put('confirm-new-email')
  async confirmNewEmail(
    @Body() body: { ticket: string },
    @Res() res: Response,
  ) {
    try {
      const base64 = decodeBase64(body.ticket);
      const detail = await this.userService.editUsrEmailConfirm(base64);
      return BaseResponse.success({ res, option: { message: "Success update user email", detail } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Put('verify')
  async verifyUser(
    @Body() body: { ticket: string, new_password: string },
    @Res() res: Response,
  ) {
    const { ticket, new_password } = body;
    try {
      const isVerified = await this.userService.verifyUser(ticket, new_password);
      if (isVerified) {
        return BaseResponse.success({ res, option: { message: "User verified successfully" } });
      } else {
        throw BaseResponse.invalid({ res, option: { message: "Invalid or expired verification token" } });
      }
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

}
