import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { ModuleGuard, OBJ_KEY } from './module.guard';
import { TModules } from 'src/types/interfaces';
import { UAuthGuard } from 'src/modules/auth/auth.guard';

export function Permission(permission: TModules[]) {
  return applyDecorators(
    SetMetadata(OBJ_KEY, permission),
    UseGuards(UAuthGuard, ModuleGuard),
  );
}
