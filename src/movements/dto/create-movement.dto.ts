// src/movements/dto/create-movement.dto.ts
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export enum MovementType { SALE='SALE', SUPPLIER_PAYMENT='SUPPLIER_PAYMENT', EXPENSE_GENERAL='EXPENSE_GENERAL', INCOME_OTHER='INCOME_OTHER', TRANSFER_IN='TRANSFER_IN', TRANSFER_OUT='TRANSFER_OUT', ADJUSTMENT='ADJUSTMENT' }

export class CreateMovementDto {
  @IsNotEmpty() accountId: string;
  @IsOptional() categoryId?: string;     // puede ser null p.ej. ajustes
  @IsOptional() supplierId?: string;
  @IsNotEmpty() userId: string;

  @IsDateString() date: string;
  @IsEnum(MovementType) type: MovementType;
  @IsNumber() amount: number;            // positivo
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() documentUrl?: string;
}

export class UpdateMovementDto {
  @IsOptional() categoryId?: string | null;
  @IsOptional() supplierId?: string | null;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsEnum(MovementType) type?: MovementType;
  @IsOptional() @IsNumber() amount?: number;
  @IsOptional() description?: string | null;
  @IsOptional() documentUrl?: string | null;
}
