import {
  IsString, IsNotEmpty, IsDateString,
  IsInt, IsArray, IsUrl, IsObject,
  IsBoolean, IsOptional, ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class CmsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cms_id?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  link_1?: string;

  @IsOptional()
  @IsString()
  link_2?: string;

  @IsOptional()
  @IsString()
  link_3?: string;

  @IsOptional()
  @IsArray()
  faq?: [];

  @IsOptional()
  @IsObject()
  blog?: [];

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  is_active?: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  created_by: number;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;

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

  @IsOptional()
  @IsDateString()
  deleted_at?: string;
}