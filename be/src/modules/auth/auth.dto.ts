import { IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { logoutOption } from 'src/types/enums';
import type { TLogoutOption } from 'src/types/interfaces';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class LogoutDto {
  @IsOptional() // allow missing query param
  @IsEnum(logoutOption)
  option?: TLogoutOption;
}
