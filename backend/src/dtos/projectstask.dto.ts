import {
    IsString, IsNotEmpty, IsDateString,
    IsInt, IsJSON, IsArray, ArrayNotEmpty, IsUrl, IsObject,
    IsBoolean, IsOptional, ValidateNested
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  class ProjectFileItem {
    @IsString()
    filename: string;
  
    @IsUrl()
    url: string;
  }
  
  export class ProjectsTaskDto {
    @IsInt()
    client_id: number;
  
    @IsOptional()
    @IsInt()
    editor_id: number;
  
    @IsString()
    @IsNotEmpty()
    project_title: string;
  
    @IsString()
    @IsOptional()
    project_category: string;
  
    @IsDateString()
    deadline: string;
  
    @IsString()
    @IsNotEmpty()
    project_description: string;
  
    @Type(() => Number)
    @IsInt()
    budget: number;

    @IsOptional()
    @IsJSON()
    tags?: any;
  
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    skills_required: string[];
  
    @IsArray()
    @ArrayNotEmpty()
    @IsUrl({}, { each: true })
    reference_links: string[];
  
    @IsString()
    @IsNotEmpty()
    additional_notes: string;
  
    @IsString()
    @IsNotEmpty()
    projects_type: string;
  
    @IsString()
    @IsNotEmpty()
    project_format: string;
  
    @IsString()
    @IsNotEmpty()
    audio_voiceover: string;
  
    @Type(() => Number)
    @IsInt()
    video_length: number;
  
    @IsString()
    @IsNotEmpty()
    preferred_video_style: string;
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProjectFileItem)
    project_files: ProjectFileItem[];
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProjectFileItem)
    sample_project_file: ProjectFileItem[];
  
    // @IsOptional()
    // @Type(() => Number)
    // is_active?: number;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    created_by: number;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    updated_by?: number;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    deleted_by?: number;
  
    @IsOptional()
    @IsBoolean()
    is_deleted?: boolean;
  }
  