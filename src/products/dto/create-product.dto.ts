// src/products/dto/product.dto.ts
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
export class CreateProductDto {
  @IsNotEmpty() categoryId: string;
  @IsNotEmpty() name: string;
  @IsOptional() sku?: string;
  @IsOptional() description?: string;
  @IsOptional() imageUrl?: string;
  @IsBoolean() isActive: boolean = true;
  @IsNumber() price: number;
}
export class UpdateProductDto {
  @IsOptional() categoryId?: string;
  @IsOptional() name?: string;
  @IsOptional() sku?: string | null;
  @IsOptional() description?: string | null;
  @IsOptional() imageUrl?: string | null;
  @IsOptional() isActive?: boolean;
  @IsOptional() @IsNumber() price?: number;
}
