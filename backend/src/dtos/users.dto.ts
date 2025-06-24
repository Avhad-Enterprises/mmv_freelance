import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsJSON,
  } from 'class-validator';
  
  export class UserDto {
    @IsOptional({ groups: ['update'] })
    @IsInt({ groups: ['update'] })
    users_id: number;
  
    @IsString({ groups: ['create', 'update'] })
    first_name: string;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsString({ groups: ['create', 'update'] })
    last_name?: string;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsString({ groups: ['create', 'update'] })
    profile_picture?: string;
  
    @IsString({ groups: ['create', 'update'] })
    phone_number: string;
  
    @IsString({ groups: ['create', 'update'] })
    Username: string;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsEmail({}, { groups: ['create', 'update'] })
    email?: string;
  
    @IsString({ groups: ['create', 'update'] })
    password: string;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsString({ groups: ['create', 'update'] })
    confirm_password?: string;
  
    @IsString({ groups: ['create', 'update'] })
    address_line_first: string;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsString({ groups: ['create', 'update'] })
    address_line_second?: string;
  
    @IsString({ groups: ['create', 'update'] })
    city: string;
  
    @IsString({ groups: ['create', 'update'] })
    state: string;
  
    @IsString({ groups: ['create', 'update'] })
    country: string;
  
    @IsString({ groups: ['create', 'update'] })
    pincode: string;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsEnum(['editor', 'collaborator'], { groups: ['create', 'update'] })
    role?: 'editor' | 'collaborator';
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsJSON({ groups: ['create', 'update'] })
    skill?: any;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsBoolean({ groups: ['create', 'update'] })
    email_notifications?: boolean;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsJSON({ groups: ['create', 'update'] })
    tags?: any;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsJSON({ groups: ['create', 'update'] })
    notes?: any;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsBoolean({ groups: ['create', 'update'] })
    aadhaar_verification?: boolean;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsBoolean({ groups: ['create', 'update'] })
    is_active?: boolean;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsInt({ groups: ['create', 'update'] })
    created_by?: number;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsInt({ groups: ['create', 'update'] })
    updated_by?: number;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsBoolean({ groups: ['create', 'update'] })
    is_deleted?: boolean;
  
    @IsOptional({ groups: ['create', 'update'] })
    @IsInt({ groups: ['create', 'update'] })
    deleted_by?: number;
  }
  