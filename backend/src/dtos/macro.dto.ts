import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsOptional,
  IsArray,
  IsString as IsStringItem
} from 'class-validator';
import { Type } from 'class-transformer';

export class MacroDto {
  @IsOptional()
  @IsInt()
  macro_id?: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  reply_template: string;

  @IsOptional()
  @IsArray()
  tags?: [];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  placeholders?: [];    

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  is_active?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  created_by: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  updated_by?: number;

  @IsOptional()
  @IsBoolean()
  is_deleted?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  deleted_by?: number;
}
