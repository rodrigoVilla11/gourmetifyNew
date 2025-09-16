// src/customer-tags/dto/create-customer-tag.dto.ts
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCustomerTagDto {
  @IsNotEmpty() name: string;
  @IsOptional() color?: string;
}

export class UpdateCustomerTagDto {
  @IsOptional() name?: string;
  @IsOptional() color?: string | null;
}
