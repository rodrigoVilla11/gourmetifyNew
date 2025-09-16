// src/ingredients/dto/ingredient.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
export enum UnitType { UNIT='UNIT', GRAM='GRAM', KILOGRAM='KILOGRAM', ML='ML', LITER='LITER', PACK='PACK', OTHER='OTHER' }

export class CreateIngredientDto {
  @IsNotEmpty() name: string;
  @IsEnum(UnitType) unit: UnitType;
  @IsNumber() wastePct: number; // 0..100
}
export class UpdateIngredientDto {
  @IsOptional() name?: string;
  @IsOptional() @IsEnum(UnitType) unit?: UnitType;
  @IsOptional() @IsNumber() wastePct?: number;
}
