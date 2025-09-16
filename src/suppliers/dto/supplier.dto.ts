// src/suppliers/dto/supplier.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
export enum SupplierPaymentTerm { ON_ACCOUNT='ON_ACCOUNT', ON_INVOICE='ON_INVOICE', CASH='CASH' }

export class CreateSupplierDto {
  @IsNotEmpty() name: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() phone?: string;
  @IsOptional() notes?: string;
  @IsEnum(SupplierPaymentTerm) defaultPaymentTerm: SupplierPaymentTerm = SupplierPaymentTerm.CASH;
}
export class UpdateSupplierDto {
  @IsOptional() name?: string;
  @IsOptional() @IsEmail() email?: string | null;
  @IsOptional() phone?: string | null;
  @IsOptional() notes?: string | null;
  @IsOptional() @IsEnum(SupplierPaymentTerm) defaultPaymentTerm?: SupplierPaymentTerm;
}

export class UpsertSupplierPriceDto {
  @IsNotEmpty() supplierId: string;
  @IsNotEmpty() ingredientId: string;
  @IsNotEmpty() price: number;
}
