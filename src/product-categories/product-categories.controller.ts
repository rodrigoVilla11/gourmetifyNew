// src/product-categories/product-categories.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { BranchId } from '../common/tenant.decorators';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from './dto/create-product-category.dto';

@Controller('product-categories')
export class ProductCategoriesController {
  constructor(private readonly svc: ProductCategoriesService) {}
  @Post() create(@BranchId() b: string, @Body() d: CreateProductCategoryDto) {
    return this.svc.create(b, d);
  }
  @Get() list(@BranchId() b: string) {
    return this.svc.list(b);
  }
  @Patch(':id') update(
    @BranchId() b: string,
    @Param('id') id: string,
    @Body() d: UpdateProductCategoryDto,
  ) {
    return this.svc.update(b, id, d);
  }
  @Delete(':id') remove(@BranchId() b: string, @Param('id') id: string) {
    return this.svc.remove(b, id);
  }
}
