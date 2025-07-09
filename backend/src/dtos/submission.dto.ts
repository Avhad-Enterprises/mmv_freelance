import { IsOptional, IsInt, IsString } from "class-validator";

class SubmissionDto {
    @IsOptional({ groups: ["insert", "update"] })
    @IsInt()
    id?: number;

    @IsInt({ groups: ["create"] })
    submitted_by: number;

    @IsOptional({ groups: ["create", "update"] })
    @IsString()
    file_url?: string;

    @IsOptional({ groups: ["create", "update"] })
    @IsString()
    message?: string;
}

export { SubmissionDto };
