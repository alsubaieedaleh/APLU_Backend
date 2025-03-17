import { IsEmail, IsString, IsOptional, IsNumber, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  password?: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  academicLevel?: string;

  @IsString()
  @IsOptional()
  preferredLanguage?: string;
}

export class UpdateGPADto {
  @IsNumber()
  gpa: number;

  @IsNumber()
  creditHours: number;
}

export class UpdatePreferencesDto {
  @IsString()
  academicLevel: string;

  @IsString()
  preferredLanguage: string;
}

export class UpdateStatusDto {
  @IsOptional()
  isActive?: boolean;
} 