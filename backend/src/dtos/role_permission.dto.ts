import { 
  IsInt, 
  IsOptional, 
  IsNotEmpty,
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';

export class RolePermissionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  role_id: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  permission_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  updated_by?: number;
}