import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GlobalVar, ITokenPayload } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { errCodes } from 'src/types/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) { }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw BaseResponse.unauthorized({ err: 'Auth Guard Missing token', option: { message: 'Unauthorized' } });
    }

    const accesToken = authHeader.split(' ')[1];
    const userAgent: string = req.headers['user-agent'] as string;

    try {
      const auth = this.authService.verifyToken(accesToken) as ITokenPayload;
      const user: GlobalVar = {
        id: auth.id,
        id0: auth.id0,
        role: auth.role,
        userAgent,
        accesToken
      };
      req.user = user;
      return true;
    } catch {
      throw BaseResponse.unauthorized({ err: 'Auth Guard unverified', option: { message: 'Unauthorized', error_code: errCodes.authGuard } });
    }
  }
}
