import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString} from 'class-validator';
import { UserRole } from './create-user.dto';

export class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() password?: string; // si viene, re-hashear
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() branchId?: string | null;
}