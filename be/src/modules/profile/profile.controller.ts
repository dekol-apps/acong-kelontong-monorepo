import { Body, Controller, Get, Put, Req, Res, UseGuards, UploadedFile } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UAuthGuard } from '../auth/auth.guard';
import { BaseResponse } from 'src/utils/base-response';
import type { Request, Response } from 'express';
import { ChangeEmailDto, ChangePasswordDto, UpdateProfileDto } from '../user/user.dto';
import { UploadUserPhotoInterceptor } from '../user/user-photo.interceptor';
import * as fs from 'fs';
import { decodeBase64, encodeBase64 } from 'src/utils/helper';
import { MailerService } from '@nestjs-modules/mailer';
import * as jwt from 'jsonwebtoken';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailerService
  ) { }

  @UseGuards(UAuthGuard)
  @Get('')
  async getProfile(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const userId = (req as any).user.id0;
      const detail = await this.userService.getDetailUser(userId);
      return BaseResponse.success({ res, option: { message: 'Success get profile', detail } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @UseGuards(UAuthGuard)
  @Put('')
  async updateProfile(
    @Req() req: Request,
    @Body() body: UpdateProfileDto,
    @Res() res: Response,
  ) {
    try {
      const userId = (req as any).user.id0;
      await this.userService.editUser(userId, body);
      const detail = await this.userService.getDetailUser(userId);
      return BaseResponse.success({ res, option: { message: 'Success update profile', detail } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @UseGuards(UAuthGuard)
  @Put('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() body: ChangePasswordDto,
    @Res() res: Response,
  ) {
    try {
      const userId = (req as any).user.id0;
      await this.userService.editUsrPasswd(userId, body);
      const detail = await this.userService.getDetailUser(userId);
      return BaseResponse.success({ res, option: { message: 'Success change password', detail } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @UseGuards(UAuthGuard)
  @Put('change-email-request')
  async changeEmailRequest(
    @Req() req: Request,
    @Body() body: ChangeEmailDto,
    @Res() res: Response,
  ) {
    try {
      const userId = (req as any).user.id0;
      const detail = await this.userService.editUsrEmailReq(userId, body);
      if (!detail.req_change_email) throw BaseResponse.unexpected({ err: 'changeEmailRequest !detail.req_change_email' });
      const base64 = encodeBase64(detail.req_change_email)
      const linkConfirmEmail = `${process.env.FE_DOMAIN}/${process.env.URL_CONFIRM_EMAIL as string}/${base64}`;
      const mailOptions = {
        from: `"Acong Kelontong <No Reply>" <${process.env.SMTP_USER as string}>`,
        to: detail.req_change_email,
        subject: "Verify New Email",
        html: `Hello <b>${detail.first_name}</b>! \nPlease click the link below to verify your new email: \n${linkConfirmEmail}`,
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

  @Put('change-password-via-email')
  async changePasswordViaEmail(
    @Body() body: { token: string, new_password: string },
    @Res() res: Response,
  ) {
    try {
      // Verify JWT token
      let decoded: any;
      try {
        decoded = jwt.verify(body.token, process.env.JWT_SECRET as string);
      } catch (err) {
        throw BaseResponse.forbidden({ err: 'changePasswordViaEmail !invalid_token', option: { message: 'Invalid or expired password change link. Please request a new invitation.' } });
      }

      // Verify token type
      if (decoded.type !== 'pwd_change') {
        throw BaseResponse.forbidden({ err: 'changePasswordViaEmail !token_type', option: { message: 'Invalid token type' } });
      }

      const detail = await this.userService.changePasswordViaEmail(decoded.email, body.new_password);
      return BaseResponse.success({ res, option: { message: "Password updated successfully", detail } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @UseGuards(UAuthGuard)
  @Put('photo')
  @UploadUserPhotoInterceptor()
  async uploadPhoto(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      const userId = (req as any).user.id0;
      if (file) {
        const folder = (req as any).uuidFolder;
        const filePath = `/uploads/users/photo/${folder}/${file.filename}`;
        const fullUrl = `${req.protocol}://${req.get('host')}${filePath}`;
        const { user, photoToRemove } = await this.userService.editUser(userId, { user_photo: fullUrl });
        if (photoToRemove) {
          try {
            fs.rmSync(`.${photoToRemove}`, { recursive: true, force: true });
          } catch (err) {
            console.warn('Failed to delete old user photo:', err.message);
          }
        }
        return BaseResponse.success({ res, option: { message: 'Success upload photo', detail: user } });
      }
      throw BaseResponse.unexpected({ err: 'uploadPhoto !no_file' });
    } catch (err) {
      if (file) {
        const folder = (req as any).uuidFolder;
        const filePath = `/uploads/users/photo/${folder}/`;
        fs.rmSync(`.${filePath}`, { recursive: true, force: true });
      }
      return BaseResponse.error({ res, err });
    }
  }

}
