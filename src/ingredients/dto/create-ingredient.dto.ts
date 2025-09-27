// create-ingredient.dto.ts
import { Transform } from 'class-transformer';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { IngredientKind, UnitType } from '@prisma/client';

export class CreateIngredientDto {
  @IsString() name: string;

  @Transform(({ value }) => String(value).trim().toUpperCase())
  @IsEnum(UnitType) unit: UnitType;

  @IsOptional()
  @IsNumberString() wastePct?: string; // o number, como prefieras

  @Transform(({ value }) => String(value).trim().toUpperCase())
  @IsEnum(IngredientKind) kind: IngredientKind;
}

export class UpdateIngredientDto {
  name?: string;
  unit?: 'UNIT' | 'GRAM' | 'KILOGRAM' | 'ML' | 'LITER' | 'PACK' | 'OTHER';
  wastePct?: string | number;
  kind?: 'RAW' | 'PREPARED';
}
