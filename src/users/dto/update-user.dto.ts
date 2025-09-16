import { IsEmail, IsEnum, IsOptional} from 'class-validator';
import { UserRole } from './create-user.dto';

export class UpdateUserDto {
  @IsOptional() name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() password?: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional() isActive?: boolean;
  @IsOptional() branchId?: string | null;
}