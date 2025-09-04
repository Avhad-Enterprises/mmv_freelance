import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class SavedFreelancerDto {
    @IsNumber()
    @IsOptional()
    saved_freelancer_id?: number;

    @IsNumber()
    projects_task_id: number;

    @IsNumber()
    user_id: number;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @IsNumber()
    @IsOptional()
    created_by?: number;

    @IsString()
    @IsOptional()
    created_at?: Date;

    @IsNumber()
    @IsOptional()
    updated_by?: number;

    @IsString()
    @IsOptional()
    updated_at?: Date;

    @IsBoolean()
    @IsOptional()
    is_deleted?: boolean;

    @IsNumber()
    @IsOptional()
    deleted_by?: number;

    @IsString()
    @IsOptional()
    deleted_at?: Date;
}
