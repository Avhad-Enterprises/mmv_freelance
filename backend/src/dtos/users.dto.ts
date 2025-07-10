import { IsEmail, IsOptional, IsString, IsBoolean, IsArray, IsNumber } from 'class-validator';


export class UsersDto {


  @IsString()
  first_name: string;


  @IsString()
  last_name: string;


  @IsString()
  username: string;


  @IsEmail()
  email: string;


  @IsString()
  phone_number: string;


  @IsOptional()
  profile_picture?: string;


  @IsString()
  address_line_first: string;


  @IsOptional()
  address_line_second?: string;


  @IsOptional()
  city?: string;


  @IsOptional()
  state?: string;


  @IsOptional()
  country?: string;


  @IsOptional()
  pincode?: string;


  @IsOptional()
  password?: string;


  @IsBoolean()
  aadhaar_verification: boolean;


  @IsBoolean()
  email_verified: boolean;


  @IsBoolean()
  phone_verified: boolean;


  @IsOptional()
  reset_token?: string;


  @IsOptional()
  reset_token_expires?: Date;


  @IsNumber()
  login_attempts: number;


  @IsBoolean()
  kyc_verified: boolean;


  @IsOptional()
  @IsString()
  role?: string;


  @IsOptional()
  banned_reason?: string;


  @IsOptional()
  bio?: string;


  @IsOptional()
  timezone?: string;


  @IsOptional()
  skill?: object;


  @IsOptional()
  email_notifications?: boolean;


  @IsOptional()
  @IsArray()
  tags?: string[];


  @IsOptional()
  notes?: object;


  @IsOptional()
  certification?: object[];


  @IsOptional()
  education?: object;


  @IsOptional()
  experience?: object;


  @IsOptional()
  services?: object;


  @IsOptional()
  previous_works?: object;


  @IsOptional()
  @IsArray()
  projects_created?: number[];


  @IsOptional()
  @IsArray()
  projects_applied?: number[];


  @IsOptional()
  @IsArray()
  projects_completed?: number[];


  @IsNumber()
  hire_count: number;


  @IsNumber()
  review_id: number;


  @IsNumber()
  total_earnings: number;


  @IsNumber()
  total_spent: number;


  @IsOptional()
  payment_method?: object;


  @IsOptional()
  payout_method?: object;


  @IsOptional()
  bank_account_info?: object;


  @IsOptional()
  account_type?: string;


  @IsOptional()
  availability?: string;


  @IsNumber()
  time_spent: number;


  @IsString()
  account_status: string;


  @IsBoolean()
  is_active: boolean;


  @IsBoolean()
  is_banned: boolean;


  @IsOptional()
  created_at?: Date;


  @IsOptional()
  updated_at?: Date;


  @IsOptional()
  updated_by?: Date;


  @IsOptional()
  last_login_at?: Date;
}



