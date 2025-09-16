// src/categories/dto/create-category.dto.ts
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export enum CategoryType { INCOME = 'INCOME', EXPENSE = 'EXPENSE' }

export class CreateCategoryDto {
  @IsNotEmpty() name: string;
  @IsEnum(CategoryType) type: CategoryType;
  @IsOptional() parentId?: string;
  @IsBoolean() isActive: boolean = true;
}

export class UpdateCategoryDto {
  @IsOptional() name?: string;
  @IsOptional() @IsEnum(CategoryType) type?: CategoryType;
  @IsOptional() parentId?: string | null;
  @IsOptional() isActive?: boolean;
}
