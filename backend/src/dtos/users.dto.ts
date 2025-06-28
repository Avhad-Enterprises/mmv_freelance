import {
  IsString, IsEmail, IsBoolean, IsInt, IsOptional, IsObject, IsDefined, IsArray, IsIn
} from 'class-validator';

export class UserDto {
  @IsOptional({ groups: ['update'] }) 
  @IsInt({ groups: ['update'] })
  user_id: number;

  @IsString({ groups: ['create', 'update'] }) first_name: string;
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  last_name?: string;

  @IsString({ groups: ['create', 'update'] }) 
  username: string;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsEmail({}, { groups: ['create', 'update'] })
  email?: string;
  
  @IsString({ groups: ['create', 'update'] }) 
  phone_number: string;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  profile_picture?: string;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  @IsDefined({ message: 'password are required' })
  password?: string;
  
  @IsString({ groups: ['create', 'update'] }) 
  address_line_first: string;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  address_line_second?: string;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  city?: string;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  state?: string;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  country?: string;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  pincode?: string;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsBoolean({ groups: ['create', 'update'] })
  aadhaar_verification?: boolean;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsBoolean({ groups: ['create', 'update'] })
  email_verified?: boolean;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsBoolean({ groups: ['create', 'update'] })
  phone_verified?: boolean;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsBoolean({ groups: ['create', 'update'] })
  kyc_verified?: boolean;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  role?: string;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] }) 
  banned_reason?: string;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] }) 
  bio?: string;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  timezone?: string;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  niche?: string;

  @IsOptional({ groups: ['create', 'update'] })
  artworks?: string[];

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsBoolean({ groups: ['create', 'update'] })
  email_notifications?: boolean;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsBoolean({ groups: ['create', 'update'] })
  tags?: boolean;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsBoolean({ groups: ['create', 'update'] })
  notes?: boolean;

  @IsOptional({ groups: ['create', 'update'] })  
  @IsObject({ groups: ['create', 'update'] })
  certification?: Record<string, any>;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsObject({ groups: ['create', 'update'] })
  education?: Record<string, any>;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  experience?: string;
  
  @IsOptional({ groups: ['create', 'update'] })
  @IsObject({ groups: ['create', 'update'] })
  services?: Record<string, any>;
    
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsObject({ groups: ['create', 'update'] })
  previous_works?: Record<string, any>;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsObject({ groups: ['create', 'update'] })
  payment_method?: Record<string, any>;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsObject({ groups: ['create', 'update'] })
  payout_method?: Record<string, any>;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsObject({ groups: ['create', 'update'] })
  bank_account_info?: Record<string, any>;

  @IsOptional({ groups: ['update'] }) 
  @IsInt({ groups: ['update'] }) projects_created?: number;
  
  @IsOptional({ groups: ['update'] }) 
  @IsInt({ groups: ['update'] }) projects_applied?: number;
  
  @IsOptional({ groups: ['update'] }) 
  @IsInt({ groups: ['update'] }) projects_completed?: number;
  
  @IsOptional({ groups: ['update'] }) 
  @IsInt({ groups: ['update'] }) hire_count?: number;
  
  @IsOptional({ groups: ['update'] }) 
  @IsInt({ groups: ['update'] }) review_id?: number;
  
  @IsOptional({ groups: ['update'] }) 
  @IsInt({ groups: ['update'] }) total_earnings?: number;
  
  @IsOptional({ groups: ['update'] }) 
  @IsInt({ groups: ['update'] }) total_spent?: number;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  account_type?: string;
    
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] }) 
  availability?: string;

  @IsOptional({ groups: ['update'] }) 
  @IsInt({ groups: ['update'] }) time_spent?: number;
  
  @IsOptional({ groups: ['create', 'update'] })
  @IsString({ groups: ['create', 'update'] }) account_status?: string;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsBoolean({ groups: ['create', 'update'] }) is_active?: boolean;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsBoolean({ groups: ['create', 'update'] }) is_banned?: boolean;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  @IsDefined({ message: 'reset_token are required' })
  reset_token?: string;

  @IsOptional({ groups: ['create', 'update'] }) // map timestamp string or Date
  reset_token_expires?: Date;

  @IsOptional({ groups: ['create', 'update'] })
  @IsInt({ groups: ['create', 'update'] })
  login_attempts?: number;
}

export class ArtworkSelectionDto {
  @IsString()
  @IsIn(['user', 'creator'])
  account_type: string;

  @IsInt()
  user_id: number;

  @IsOptional()
  @IsInt()
  projects_task_id?: number;

  @IsOptional()
  artworks?: string | string[];
}

export class NicheSelectionDto {
  @IsString()
  @IsIn(['user', 'creator'])
  account_type: string;

  @IsInt()
  user_id: number;

  @IsOptional()
  @IsInt()
  projects_task_id?: number;

  @IsString()
  niche: string;
}
