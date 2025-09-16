// src/customer-addresses/dto/create-customer-address.dto.ts
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCustomerAddressDto {
  @IsNotEmpty() customerId: string;
  @IsOptional() label?: string;
  @IsNotEmpty() address: string;
  @IsOptional() city?: string;
  @IsOptional() state?: string;
  @IsOptional() postalCode?: string;
  @IsBoolean() isDefault: boolean = false;
}

export class UpdateCustomerAddressDto {
  @IsOptional() label?: string | null;
  @IsOptional() address?: string;
  @IsOptional() city?: string | null;
  @IsOptional() state?: string | null;
  @IsOptional() postalCode?: string | null;
  @IsOptional() isDefault?: boolean;
}
