// src/products/products.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(branchId: string, dto: CreateProductDto) {
    const cat = await this.prisma.productCategory.findFirst({ where: { id: dto.categoryId, branchId }});
    if (!cat) throw new BadRequestException('categoryId does not belong to branch');

    const dup = await this.prisma.product.findFirst({ where: { branchId, name: dto.name }});
    if (dup) throw new BadRequestException('Product name exists');

    const now = new Date();
    return this.prisma.product.create({
      data: {
        branchId, categoryId: dto.categoryId, name: dto.name,
        sku: dto.sku ?? null, description: dto.description ?? null, imageUrl: dto.imageUrl ?? null,
        isActive: dto.isActive ?? true, status: 'ACTIVE', price: new Prisma.Decimal(dto.price),
        createdAt: now, updatedAt: now,
      },
    });
  }

  list(branchId: string) {
    return this.prisma.product.findMany({ where: { branchId }, orderBy: { name: 'asc' }, include: { category: true, recipe: { include: { items: true }}}});
  }

  async update(branchId: string, id: string, dto: UpdateProductDto) {
    const row = await this.prisma.product.findFirst({ where: { id, branchId }});
    if (!row) throw new NotFoundException('Product not found');
    if (dto.categoryId) {
      const cat = await this.prisma.productCategory.findFirst({ where: { id: dto.categoryId, branchId }});
      if (!cat) throw new BadRequestException('categoryId does not belong to branch');
    }
    const data: any = { ...dto, updatedAt: new Date() };
    if (dto.price !== undefined) data.price = new Prisma.Decimal(dto.price);
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(branchId: string, id: string) {
    const row = await this.prisma.product.findFirst({ where: { id, branchId }});
    if (!row) throw new NotFoundException('Product not found');
    return this.prisma.product.delete({ where: { id }});
  }
}
