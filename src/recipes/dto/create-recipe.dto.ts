// src/recipes/dto/recipe.dto.ts
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

// Crear/actualizar receta en una sola pasada
export class UpsertRecipeDto {
  @IsNotEmpty() productId: string;
  @IsArray() items: Array<{
    ingredientId: string;
    qtyPerUnit: number; // en la unidad del ingrediente
    unit: string; // debe coincidir con ingredient.unit
  }>;
}
