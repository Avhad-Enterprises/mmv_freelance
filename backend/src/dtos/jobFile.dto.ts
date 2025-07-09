import { IsOptional, IsString, IsNotEmpty, IsInt } from "class-validator";

class JobFileDto {
    @IsOptional({ groups: ["insert", "update"] })
    @IsInt()
    id?: number;

    @IsInt({ groups: ["create"] })
    job_id: number;

    @IsString({ groups: ["create"] })
    @IsNotEmpty({ groups: ["create"] })
    file_name: string;

    @IsString({ groups: ["create"] })
    @IsNotEmpty({ groups: ["create"] })
    file_url: string;
}

export { JobFileDto };
