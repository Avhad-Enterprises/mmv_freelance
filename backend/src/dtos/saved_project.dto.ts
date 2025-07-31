import { IsNotEmpty, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class SavedProjectsDto {
  @IsNotEmpty()
  @IsInt()
  projects_task_id: number;

  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_deleted?: boolean;

  @IsOptional()
  @IsInt()
  deleted_by?: number;

  @IsOptional()
  deleted_at?: Date;

  @IsOptional()
  @IsInt()
  created_by?: number;

  @IsOptional()
  @IsInt()
  updated_by?: number;
}