import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
export enum UserRole { 
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  COOK = 'COOK',
  WAITER = 'WAITER'
}

export class CreateUserDto {
  @IsNotEmpty() name: string;
  @IsEmail() email: string;
  @IsString() password: string;
  @IsEnum(UserRole) role: UserRole;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() branchId?: string;
}
