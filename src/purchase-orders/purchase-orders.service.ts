// src/purchase-orders/purchase-orders.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddPOItemDto,
  CreatePurchaseOrderDto,
  PurchaseOrderStatus,
  SetPOStatusDto,
} from './dto/po.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(branchId: string, dto: CreatePurchaseOrderDto) {
    const sup = await this.prisma.supplier.findFirst({
      where: { id: dto.supplierId, branchId },
    });
    if (!sup)
      throw new BadRequestException('supplierId does not belong to branch');

    // ✅ validar user creador
    const user = await this.prisma.user.findFirst({
      where: { id: dto.createdBy },
      select: { id: true, branchId: true, tenantId: true },
    });
    if (!user) throw new BadRequestException('createdBy user not found');

    const now = new Date();
    return this.prisma.purchaseOrder.create({
      data: {
        supplierId: dto.supplierId,
        branchId,
        status: 'DRAFT' as any,
        date: new Date(dto.date),
        total: new Prisma.Decimal(0),
        paymentTerm: sup.defaultPaymentTerm,
        createdBy: dto.createdBy, // 👈 usar el user real
        createdAt: now,
        updatedAt: now,
      },
      include: { items: true },
    });
  }
  list(branchId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
      include: { supplier: true, items: { include: { ingredient: true } } },
    });
  }

  async addItem(branchId: string, dto: AddPOItemDto) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id: dto.purchaseOrderId, branchId },
    });
    if (!po) throw new NotFoundException('PO not found');
    if (po.status !== 'DRAFT' && po.status !== 'ORDERED')
      throw new BadRequestException('Cannot modify received/cancelled PO');

    const ing = await this.prisma.ingredient.findFirst({
      where: { id: dto.ingredientId, branchId },
    });
    if (!ing)
      throw new BadRequestException('ingredientId does not belong to branch');

    return this.prisma.$transaction(async (tx) => {
      await tx.purchaseOrderItem.create({
        data: {
          purchaseOrderId: po.id,
          ingredientId: dto.ingredientId,
          qty: new Prisma.Decimal(dto.qty),
          unitPrice: new Prisma.Decimal(dto.unitPrice),
          subtotal: new Prisma.Decimal(dto.qty).mul(dto.unitPrice),
        },
      });

      const { _sum } = await tx.purchaseOrderItem.aggregate({
        where: { purchaseOrderId: po.id },
        _sum: { subtotal: true },
      });

      return tx.purchaseOrder.update({
        where: { id: po.id },
        data: {
          total: _sum.subtotal ?? new Prisma.Decimal(0),
          updatedAt: new Date(),
        },
        include: { items: true },
      });
    });
  }

  async setStatus(branchId: string, id: string, dto: SetPOStatusDto) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, branchId },
      include: { items: true, supplier: true },
    });
    if (!po) throw new NotFoundException('PO not found');

    // Recepción: sumar stock + actualizar precios proveedor
    if (dto.status === PurchaseOrderStatus.RECEIVED) {
      if (!po.items.length) throw new BadRequestException('PO has no items');

      await this.prisma.$transaction(async (tx) => {
        for (const it of po.items) {
          // sumar inventario (en unidad del ingrediente)
          const inv = await tx.inventoryItem.findUnique({
            where: { ingredientId: it.ingredientId },
          });
          if (!inv)
            throw new BadRequestException(
              `No inventory for ingredient ${it.ingredientId}`,
            );
          const newQty = inv.qty.plus(it.qty);
          await tx.inventoryItem.update({
            where: { ingredientId: it.ingredientId },
            data: { qty: newQty, updatedAt: new Date() },
          });

          // actualizar precio del supplier
          const link = await tx.supplierIngredient.findFirst({
            where: { supplierId: po.supplierId, ingredientId: it.ingredientId },
          });
          if (!link) {
            await tx.supplierIngredient.create({
              data: {
                supplierId: po.supplierId,
                ingredientId: it.ingredientId,
                price: it.unitPrice,
                createdAt: new Date(),
              },
            });
          } else {
            await tx.supplierIngredient.update({
              where: { id: link.id },
              data: { price: it.unitPrice, createdAt: new Date() },
            });
          }
        }
        await tx.purchaseOrder.update({
          where: { id: po.id },
          data: { status: dto.status as any, updatedAt: new Date() },
        });
      });

      return this.prisma.purchaseOrder.findUnique({
        where: { id: po.id },
        include: { items: true },
      });
    }

    // Otros estados
    return this.prisma.purchaseOrder.update({
      where: { id: po.id },
      data: { status: dto.status as any, updatedAt: new Date() },
      include: { items: true },
    });
  }
}
