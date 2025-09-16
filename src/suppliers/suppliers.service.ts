// src/suppliers/suppliers.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SupplierPaymentTerm } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  UpsertSupplierPriceDto,
} from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(branchId: string, dto: CreateSupplierDto) {
    const dup = await this.prisma.supplier.findFirst({
      where: { branchId, name: dto.name },
    });
    if (dup) throw new BadRequestException('Supplier exists');
    const now = new Date();
    return this.prisma.supplier.create({
      data: {
        branchId,
        name: dto.name,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        notes: dto.notes ?? null,
        defaultPaymentTerm: dto.defaultPaymentTerm as any,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  list(branchId: string) {
    return this.prisma.supplier.findMany({
      where: { branchId },
      orderBy: { name: 'asc' },
    });
  }

  async update(branchId: string, id: string, dto: UpdateSupplierDto) {
    const row = await this.prisma.supplier.findFirst({
      where: { id, branchId },
    });
    if (!row) throw new NotFoundException('Supplier not found');
    return this.prisma.supplier.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() },
    });
  }

  async upsertPrice(branchId: string, dto: UpsertSupplierPriceDto) {
    const [sup, ing] = await Promise.all([
      this.prisma.supplier.findFirst({
        where: { id: dto.supplierId, branchId },
      }),
      this.prisma.ingredient.findFirst({
        where: { id: dto.ingredientId, branchId },
      }),
    ]);
    if (!sup || !ing)
      throw new BadRequestException(
        'Supplier/Ingredient must belong to branch',
      );
    const now = new Date();
    // Mantener última referencia de precio
    const link = await this.prisma.supplierIngredient.findFirst({
      where: { supplierId: dto.supplierId, ingredientId: dto.ingredientId },
    });
    if (!link) {
      return this.prisma.supplierIngredient.create({
        data: {
          supplierId: dto.supplierId,
          ingredientId: dto.ingredientId,
          price: new Prisma.Decimal(dto.price),
          createdAt: now,
        },
      });
    }
    return this.prisma.supplierIngredient.update({
      where: { id: link.id },
      data: { price: new Prisma.Decimal(dto.price), createdAt: now },
    });
  }
}
