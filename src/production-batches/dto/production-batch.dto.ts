// src/production-batches/dto/create-production-batch.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateProductionBatchDto {
  @IsNotEmpty() ingredientRecipeId: string;  // ID de la receta del preparado
  @IsNumber() @Min(0.0001) outputQty: number; // cantidad producida (misma unidad del preparado)
  @IsNotEmpty() createdByUserId: string;      // user.id que crea el batch
  @IsOptional() @IsDateString() producedAt?: string; // opcional; default: now
}
