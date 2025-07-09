import {
    IsOptional,
    IsInt,
    IsString,
    IsBoolean,
    IsNumber,
} from "class-validator";

export class ApplicationDto {
    @IsOptional({ groups: ["insert", "update"] })
    @IsInt()
    id?: number;

    @IsInt({ groups: ["create"] })
    applied_to_job_id: number;

    @IsInt({ groups: ["create"] })
    applicant_id: number;

    @IsOptional({ groups: ["create", "update"] })
    @IsString()
    resume_url?: string;

    @IsOptional({ groups: ["create", "update"] })
    @IsString()
    cover_letter?: string;

    @IsOptional({ groups: ["create", "update"] })
    @IsNumber({}, { groups: ["create", "update"] })
    expected_amount?: number;

    @IsOptional({ groups: ["update"] })
    @IsBoolean({ groups: ["update"] })
    is_hired?: boolean;

    @IsOptional({ groups: ["insert", "update"] })
    @IsString()
    applied_at?: string;
}
