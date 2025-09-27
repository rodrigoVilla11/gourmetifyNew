import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested, IsEnum, IsNumber } from 'class-validator';
import { UnitType } from '@prisma/client';

export class UpsertIngredientRecipeItemDto {
  @IsNotEmpty()
  ingredientId: string;

  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  qtyPerUnit: number;

  @IsEnum(UnitType)
  unit: UnitType;
}

export class UpsertIngredientRecipeDto {
  @IsNotEmpty()
  preparedIngredientId: string;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertIngredientRecipeItemDto)
  items: UpsertIngredientRecipeItemDto[];
}
