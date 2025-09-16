// src/categories/categories.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(branchId: string, dto: CreateCategoryDto) {
    const dup = await this.prisma.category.findFirst({ where: { branchId, name: dto.name, type: dto.type } });
    if (dup) throw new BadRequestException('Category already exists for branch and type');

    if (dto.parentId) {
      const parent = await this.prisma.category.findFirst({ where: { id: dto.parentId, branchId } });
      if (!parent) throw new BadRequestException('parentId does not belong to branch');
    }

    const now = new Date();
    return this.prisma.category.create({
      data: { branchId, name: dto.name, type: dto.type, parentId: dto.parentId ?? null, isActive: dto.isActive ?? true, createdAt: now, updatedAt: now },
    });
  }

  list(branchId: string) {
    return this.prisma.category.findMany({ where: { branchId }, orderBy: [{ type: 'asc' }, { name: 'asc' }] });
  }

  async detail(branchId: string, id: string) {
    const row = await this.prisma.category.findFirst({ where: { id, branchId } });
    if (!row) throw new NotFoundException('Category not found');
    return row;
  }

  async update(branchId: string, id: string, dto: UpdateCategoryDto) {
    await this.detail(branchId, id);
    if (dto.parentId) {
      const parent = await this.prisma.category.findFirst({ where: { id: dto.parentId, branchId } });
      if (!parent) throw new BadRequestException('parentId does not belong to branch');
    }
    return this.prisma.category.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });
  }

  async remove(branchId: string, id: string) {
    await this.detail(branchId, id);
    return this.prisma.category.delete({ where: { id } });
  }
}
