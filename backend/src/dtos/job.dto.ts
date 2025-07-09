import {
    IsOptional,
    IsString,
    IsNotEmpty,
    IsInt,
    IsBoolean,
} from "class-validator";

class JobDto {
    @IsOptional({ groups: ["insert", "update"] })
    @IsInt()
    id: number;

    @IsString({ groups: ["create", "update"] })
    @IsNotEmpty({ groups: ["create"] })
    title: string;

    @IsOptional({ groups: ["create", "update"] })
    @IsString()
    description: string;

    @IsOptional({ groups: ["create", "update"] })
    @IsBoolean({ groups: ["create", "update"] })
    is_active?: boolean;

    @IsOptional({ groups: ["create", "update"] })
    @IsBoolean({ groups: ["create", "update"] })
    is_completed?: boolean;

    @IsOptional({ groups: ["create", "update"] })
    @IsBoolean({ groups: ["create", "update"] })
    is_pending?: boolean;

    @IsOptional({ groups: ["create", "update"] })
    @IsInt({ groups: ["create", "update"] })
    created_by?: number;

    @IsOptional({ groups: ["create", "update"] })
    @IsInt({ groups: ["create", "update"] })
    assigned_to?: number;
}

export { JobDto };
