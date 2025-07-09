import {
    IsOptional,
    IsInt,
    IsString,
    IsDateString,
    IsBoolean,
    IsNotEmpty,
} from "class-validator";

class MilestoneDto {
    @IsOptional({ groups: ["insert", "update"] })
    @IsInt()
    id?: number;

    @IsInt({ groups: ["create", "update"] })
    job_id: number;

    @IsString({ groups: ["create", "update"] })
    @IsNotEmpty({ groups: ["create"] })
    title: string;

    @IsOptional({ groups: ["create", "update"] })
    @IsString()
    description?: string;

    @IsOptional({ groups: ["create", "update"] })
    @IsDateString()
    due_date?: string;

    @IsOptional({ groups: ["update"] })
    @IsBoolean()
    completed?: boolean;
}

export { MilestoneDto };
