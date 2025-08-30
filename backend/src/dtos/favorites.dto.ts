import {
    IsEnum,
    IsInt,
    ValidateIf,
    IsOptional,
    IsNumber,
  } from 'class-validator';
  
  // Enum for favorite types
  export enum FavoriteType {
    PROJECT = 'project',
    FREELANCER = 'freelancer',
  }

  export class favoritesDto {
    @IsInt()
    user_id: number;
  
    @IsEnum(FavoriteType, {
     message: 'favorite_type must be either "project" or "freelancer"', })
    favorite_type: FavoriteType;
  
    @ValidateIf((o) => o.favorite_type === FavoriteType.PROJECT)
    @IsInt({ message: 'favorite_project_id must be an integer if type is project' })
    favorite_project_id?: number;
  
    @ValidateIf((o) => o.favorite_type === FavoriteType.FREELANCER)
    @IsInt({ message: 'favorite_freelancer_id must be an integer if type is freelancer' })
    favorite_freelancer_id?: number;
    
    @IsInt()
    created_by: number;
  
    @IsOptional()
    @IsInt()
    is_active?: number;
  
    @IsOptional()
    @IsInt()
    updated_by?: number;
 
}
  