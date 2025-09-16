import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
export enum UserRole { ADMIN='ADMIN', MANAGER='MANAGER', CASHIER='CASHIER', COOK='COOK' }

export class CreateUserDto {
  @IsNotEmpty() name: string;
  @IsEmail() email: string;
  @IsString() password: string;
  @IsEnum(UserRole) role: UserRole;
  @IsBoolean() isActive: boolean = true;
  @IsOptional() branchId?: string; // puede ser null
}

