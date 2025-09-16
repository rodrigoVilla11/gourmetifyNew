// src/cash-closures/dto/create-cash-closure.dto.ts
import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCashClosureDto {
  @IsNotEmpty() accountId: string;
  @IsNotEmpty() userId: string;
  @IsDateString() date: string; // día a cerrar
  @IsNumber() realBalance: number; // contado físico
  @IsNumber() openingBalance: number; // opcional si querés sobreescribir (en este ejemplo lo pasamos)
}
