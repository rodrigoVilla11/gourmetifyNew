// src/product-categories/dto/pc.dto.ts
import { IsBoolean, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
export class CreateProductCategoryDto {
  @IsNotEmpty() name: string;
  @IsOptional() @IsInt() position?: number;
  @IsBoolean() isActive: boolean = true;
}
export class UpdateProductCategoryDto {
  @IsOptional() name?: string;
  @IsOptional() @IsInt() position?: number | null;
  @IsOptional() isActive?: boolean;
}
