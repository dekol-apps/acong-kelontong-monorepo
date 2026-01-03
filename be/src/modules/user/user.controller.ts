import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UAuthGuard } from '../auth/auth.guard';
import { BaseResponse } from 'src/utils/base-response';
import type { Response } from 'express';
import { GetUserListDto, InviteUserDto } from './user.dto';
import { encodeBase64 } from 'src/utils/helper';
import { MailerService } from '@nestjs-modules/mailer';
import { Permission } from 'src/global/permission.decoratior';
import { Types } from 'mongoose';

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
      const linkChangePassword = `${process.env.FE_DOMAIN}/${process.env.URL_CHANGE_PASSWORD as string}/${base64}`;
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
  @Put('detail/:user_id')
  async editProfile(
    @Param('user_id') user_id: Types.ObjectId,
    @Body()
    body: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
    },
    @Res() res: Response,
  ) {
    try {
      const detail = await this.userService.editUser(user_id, body);
      return BaseResponse.success({ res, option: { message: 'Success edit user', detail } })
    } catch (err) {
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
      const linkChangePassword = `${process.env.FE_DOMAIN}/${process.env.URL_CHANGE_PASSWORD as string}/${base64}`;
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
      const detail = await this.userService.editUser(user_id, body);
      return BaseResponse.success({ res, option: { message: 'Success edit user', detail } })
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
      console.log('masuk verify')
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
