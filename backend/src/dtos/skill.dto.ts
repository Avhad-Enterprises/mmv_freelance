import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class SkillsDto {
  @IsNotEmpty()
  @IsString()
  skill_name: string;

  @IsOptional()
  @IsInt()
  is_active?: number; // 0 = inactive, 1 = active

  @IsNotEmpty()
  @IsInt()
  created_by: number;

  @IsOptional()
  @IsInt()
  updated_by?: number;

  @IsOptional()
  @IsBoolean()
  is_deleted?: boolean;

  @IsOptional()
  @IsInt()
  deleted_by?: number;
}
