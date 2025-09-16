// src/product-categories/product-categories.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductCategoryDto, UpdateProductCategoryDto } from './dto/create-product-category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(private prisma: PrismaService) {}
  async create(branchId: string, dto: CreateProductCategoryDto) {
    const dup = await this.prisma.productCategory.findFirst({ where: { branchId, name: dto.name }});
    if (dup) throw new BadRequestException('Category already exists');
    const now = new Date();
    return this.prisma.productCategory.create({ data: { branchId, ...dto, createdAt: now, updatedAt: now }});
  }
  list(branchId: string) { return this.prisma.productCategory.findMany({ where: { branchId }, orderBy: [{ position: 'asc' },{ name: 'asc' }] }); }
  async update(branchId: string, id: string, dto: UpdateProductCategoryDto) {
    const row = await this.prisma.productCategory.findFirst({ where: { id, branchId } });
    if (!row) throw new NotFoundException('Category not found');
    return this.prisma.productCategory.update({ where: { id }, data: { ...dto, updatedAt: new Date() }});
  }
  async remove(branchId: string, id: string) {
    const row = await this.prisma.productCategory.findFirst({ where: { id, branchId } });
    if (!row) throw new NotFoundException('Category not found');
    return this.prisma.productCategory.delete({ where: { id } });
  }
}
