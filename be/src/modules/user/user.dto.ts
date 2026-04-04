import {
  IsBoolean,
  IsOptional,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { IsObjectId } from 'src/global/is-object-id.decorator';
import { Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { UserDocument } from './user.schema';
import { Transform } from 'class-transformer';

export class GetUserListDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  verified?: boolean;
}

export class InviteUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  first_name: string;
  @IsNotEmpty()
  last_name: string;
  @IsObjectId() // ✅ checks it's a valid ObjectId string
  role: Types.ObjectId;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  old_password: string;
  @IsNotEmpty()
  new_password: string;
}

export class IEditUser {
  @IsOptional()
  first_name?: string;
  @IsOptional()
  last_name?: string;
  @IsOptional()
  @IsString()
  user_photo?: string;
  @IsOptional()
  role?: Types.ObjectId;
}

export class ChangeEmailDto {
  @IsNotEmpty()
  new_email: string;
}

export interface TmpUser extends UserDocument {
  tmpPassword: string;
}