import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsNumber, IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  gpa?: number;

  @IsNumber()
  @IsOptional()
  creditHours?: number;

  @IsObject()
  @IsOptional()
  profile?: {
    avatar?: string;
    bio?: string;
    academicLevel?: string;
    preferredLanguage?: string;
  };
} 