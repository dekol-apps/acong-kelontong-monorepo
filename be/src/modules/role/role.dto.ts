import { ArrayUnique, IsArray, IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/global/global.dto';
import { modules } from 'src/types/constants';
import { TModules } from 'src/types/interfaces';

export interface RoleUpsertPayload {
  role_name: string;
  modules: TModules[];
  active?: boolean;
}

export class GetRolesDTO extends PaginationDto {
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class RoleUpsertDto implements RoleUpsertPayload {
  @IsString()
  role_name!: string;

  @IsArray()
  @ArrayUnique()
  @IsIn(modules as TModules[], { each: true })
  modules!: TModules[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}