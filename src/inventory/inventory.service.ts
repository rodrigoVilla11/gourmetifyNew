// src/inventory/inventory.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustInventoryDto } from './dto/create-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  list(branchId: string) {
    return this.prisma.inventoryItem.findMany({
      where: { branchId },
      include: { ingredient: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async adjust(branchId: string, dto: AdjustInventoryDto) {
    const inv = await this.prisma.inventoryItem.findUnique({
      where: { branchId_ingredientId: { branchId, ingredientId: dto.ingredientId } },
      include: { ingredient: true },
    });
    if (!inv) throw new BadRequestException('Inventory item not found for branch');

    const newQty = inv.qty.plus(new Prisma.Decimal(dto.deltaQty));
    if (newQty.lessThan(0)) throw new BadRequestException('Resulting quantity would be negative');

    return this.prisma.inventoryItem.update({
      where: { branchId_ingredientId: { branchId, ingredientId: dto.ingredientId } },
      data: {
        qty: newQty,
        minQty: dto.minQty !== undefined ? new Prisma.Decimal(dto.minQty) : inv.minQty,
      },
    });
  }
}
