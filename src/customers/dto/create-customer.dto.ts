// src/customers/dto/create-customer.dto.ts
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty() name: string;
  @IsEmail() email: string;
  @IsOptional() phone?: string;
  @IsBoolean() marketingOptIn: boolean = false;
}

export class UpdateCustomerDto {
  @IsOptional() name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() phone?: string;
  @IsOptional() marketingOptIn?: boolean;
}
