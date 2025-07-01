import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsDateString,
} from 'class-validator';

export class CompressVideoDto {

    @IsString()
    provider: string;

    @IsString()
    fileId: string;

}