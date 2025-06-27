import {
  IsString, IsEmail, IsBoolean, IsInt, IsOptional, IsObject, IsDefined
} from 'class-validator';

export class UserDto {
  @IsOptional({ groups: ['update'] }) 
  @IsInt({ groups: ['update'] })
  users_id: number;

  @IsString({ groups: ['create', 'update'] }) first_name: string;
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  last_name?: string;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] }) 
  username: string;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsEmail({}, { groups: ['create', 'update'] })
  email?: string;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] }) 
  phone_number: string;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  profile_picture?: string;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  @IsDefined({ message: 'password are required' })
  password?: string;
  
  @IsOptional({ groups: ['create', 'update'] }) 
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
  role: string;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] }) 
  bio: string;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  timezone?: string;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsObject()
  skill?: Record<string, any>;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsBoolean({ groups: ['create', 'update'] })
  email_notifications?: boolean;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsObject()
  tags?: Record<string, any>;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsBoolean({ groups: ['create', 'update'] })
  notes?: boolean;

  @IsOptional({ groups: ['create', 'update'] })  
  @IsObject({ groups: ['create', 'update'] })
  certification: Record<string, any>;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsObject({ groups: ['create', 'update'] })
  education: Record<string, any>;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  experience: string;
  
  @IsOptional()
  @IsObject()
  services: Record<string, any>;
    
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsObject()
  previous_works?: Record<string, any>;

  @IsOptional({ groups: ['create', 'update'] }) 
  @IsObject({ groups: ['create', 'update'] })
  payment_method: Record<string, any>;
        
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsObject()
  bank_account_info?: Record<string, any>;

  // Numeric stats
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
  @IsString()
  account_type: string;
    
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] }) 
  availability: string;

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
  @IsString({ groups: ['create', 'update'] })
  login_attempts?: string;
  
  @IsOptional({ groups: ['create', 'update'] }) 
  @IsString({ groups: ['create', 'update'] })
  banned_reason?: string;
}
