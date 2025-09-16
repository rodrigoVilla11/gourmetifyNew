// src/categories/categories.controller.ts
import { Controller, Post, Get, Param, Patch, Delete, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { BranchId } from '../common/tenant.decorators';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly svc: CategoriesService) {}

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateCategoryDto) {
    if (!branchId) throw new Error('x-branch-id is required');
    return this.svc.create(branchId, dto);
  }

  @Get()
  list(@BranchId() branchId: string) {
    return this.svc.list(branchId);
  }

  @Get(':id')
  detail(@BranchId() branchId: string, @Param('id') id: string) {
    return this.svc.detail(branchId, id);
  }

  @Patch(':id')
  update(@BranchId() branchId: string, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.svc.update(branchId, id, dto);
  }

  @Delete(':id')
  remove(@BranchId() branchId: string, @Param('id') id: string) {
    return this.svc.remove(branchId, id);
  }
}
