import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TModules } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';

export const OBJ_KEY = 'permission';

@Injectable()
export class ModuleGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<TModules[]>(
      OBJ_KEY,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const user = request.user; // from UAuthGuard

    const havePermission = requiredPermission.some(permission => user.role.modules.includes(permission));

    console.log({havePermission, modules: user.role.modules})

    if (!havePermission) throw BaseResponse.forbidden({ err: 'ModuleGuard !havePermission', option: { message: "You don't have permission for this access" } });;
    return true;
  }
}
