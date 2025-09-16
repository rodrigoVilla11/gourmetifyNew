// src/inventory/dto/inventory.dto.ts
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
export class AdjustInventoryDto {
  @IsNotEmpty() ingredientId: string;
  @IsNumber() deltaQty: number; // +ingreso / -egreso (misma unidad del ingrediente)
  @IsOptional() minQty?: number;
  @IsOptional() note?: string;
}
