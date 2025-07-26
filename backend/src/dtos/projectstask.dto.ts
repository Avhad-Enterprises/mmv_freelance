import {
  IsNotEmpty, IsString, IsArray, IsInt, IsDateString, IsBoolean, IsObject
} from 'class-validator';

export class ProjectsTaskDto {
  @IsInt() 
  client_id: number;
  
  @IsInt() 
  editor_id: number;
  
  @IsString() 
  project_title: string;
  
  @IsString() 
  project_category: string;
  
    @IsDateString()
    deadline: string;
  
  @IsString() 
  project_description: string;
  
    @Type(() => Number)
    @IsInt()
    budget: number;

    @IsOptional()
    @IsJSON()
    tags?: any;
  
  @IsArray() 
  skills_required: string[];
  
  @IsArray() 
  reference_links: string[];
  
  @IsString() 
  additional_notes: string;
  
  @IsObject() 
  status: object;
  
  @IsString() 
  projects_type: string;
  
  @IsString() 
  project_format: string;
  
  @IsString() 
  audio_voiceover: string;
  
  @IsInt() 
  video_length: number;
  
  @IsString() 
  preferred_video_style: string;
  
  @IsArray() 
  sample_project_file: string[];
  
  @IsArray() 
  project_files: string[];
  
  @IsArray() 
  show_all_files: string[];
  
  @IsString() 
  url: string;
  
  @IsString() 
  meta_title: string;
  
  @IsString() 
  meta_description: string;
  
  @IsInt() 
  is_active: number;
  
  @IsInt() 
  created_by: number;
}
