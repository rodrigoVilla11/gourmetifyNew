// src/orders/orders.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, OrderChannel, OrderStatus, UpdateOrderStatusDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(branchId: string, dto: CreateOrderDto) {
    if (dto.channel === OrderChannel.DELIVERY && !dto.addressId) {
      throw new BadRequestException('addressId is required for DELIVERY channel');
    }

    const cashier = await this.prisma.user.findFirst({ where: { id: dto.cashierId, branchId } });
    if (!cashier) throw new BadRequestException('cashierId does not belong to branch');

    if (dto.customerId) {
      const c = await this.prisma.customer.findFirst({ where: { id: dto.customerId, branchId } });
      if (!c) throw new BadRequestException('customerId does not belong to branch');
      if (dto.addressId) {
        const addr = await this.prisma.customerAddress.findFirst({
          where: { id: dto.addressId, customerId: dto.customerId },
        });
        if (!addr) throw new BadRequestException('addressId must belong to the same customer');
      }
    }

    const now = new Date();
    return this.prisma.orders.create({
      data: {
        branchId,
        cashierId: dto.cashierId,
        customerId: dto.customerId ?? null,
        channel: dto.channel as any,
        addressId: dto.addressId ?? null,
        status: OrderStatus.OPEN as any,
        paymentStatus: PaymentStatus.UNPAID as any,
        customerName: dto.customerName ?? null,
        deliveryNotes: dto.deliveryNotes ?? null,
        subtotal: new Prisma.Decimal(0),
        discountTotal: new Prisma.Decimal(0),
        total: new Prisma.Decimal(0),
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  list(branchId: string) {
    return this.prisma.orders.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, payments: true, customer: true, address: true },
    });
  }

  async detail(branchId: string, id: string) {
    const row = await this.prisma.orders.findFirst({
      where: { id, branchId },
      include: { items: { include: { product: true } }, payments: true, customer: true, address: true },
    });
    if (!row) throw new NotFoundException('Order not found');
    return row;
  }

  async setStatus(branchId: string, id: string, dto: UpdateOrderStatusDto) {
    const order = await this.detail(branchId, id);
    if (order.status === 'CANCELLED') throw new BadRequestException('Order is cancelled');

    if (dto.status === OrderStatus.DELIVERED) {
      await this.generateConsumptionsAndDecrementStock(order.id, branchId);
      await this.generateCostsPerItem(order.id);
    }

    return this.prisma.orders.update({
      where: { id },
      data: { status: dto.status as any, updatedAt: new Date() },
    });
  }

  private async generateConsumptionsAndDecrementStock(orderId: string, branchId: string) {
    await this.prisma.$transaction(async (tx) => {
      const items = await tx.orderItem.findMany({
        where: { orderId },
        include: {
          product: { include: { recipe: { include: { items: { include: { ingredient: true } } } } } },
        },
      });

      for (const it of items) {
        const recipe = it.product.recipe;
        if (!recipe || recipe.items.length === 0) continue;

        for (const ri of recipe.items) {
          if (ri.unit !== ri.ingredient.unit) {
            throw new BadRequestException(`Unit mismatch for ingredient ${ri.ingredientId}`);
          }
          const qtyIngredient = new Prisma.Decimal(ri.qtyPerUnit).mul(it.qty);

          await tx.productConsumption.create({
            data: {
              orderItemId: it.id,
              productId: it.productId,
              ingredientId: ri.ingredientId,
              qtyProduct: it.qty,
              qtyIngredient,
              unit: ri.unit,
              createdAt: new Date(),
            },
          });

          const inv = await tx.inventoryItem.findUnique({ where: { ingredientId: ri.ingredientId } });
          if (!inv) throw new BadRequestException(`No inventory for ingredient ${ri.ingredientId}`);
          const newQty = inv.qty.minus(qtyIngredient);
          await tx.inventoryItem.update({
            where: { ingredientId: ri.ingredientId },
            data: { qty: newQty, updatedAt: new Date() },
          });
        }
      }
    });
  }

  private async getIngredientUnitCost(tx: PrismaClient | any, ingredientId: string): Promise<Prisma.Decimal> {
    const ing = await tx.ingredient.findUnique({ where: { id: ingredientId } });
    if (!ing) return new Prisma.Decimal(0)
;

    if ((ing as any).kind === 'PREPARED') {
      const lastBatch = await tx.productionBatch.findFirst({
        where: { ingredientRecipe: { preparedIngredientId: ingredientId } },
        orderBy: { producedAt: 'desc' },
        select: { unitCost: true },
      });
      return lastBatch?.unitCost ?? new Prisma.Decimal(0)
;
    }

    const inv = await tx.inventoryItem.findUnique({ where: { ingredientId } });
    if (inv && (inv as any).avgCost) return (inv as any).avgCost;
    return new Prisma.Decimal(0)
;
  }

  private async generateCostsPerItem(orderId: string) {
    await this.prisma.$transaction(async (tx) => {
      const items = await tx.orderItem.findMany({
        where: { orderId },
        include: { consumptions: true },
      });

      for (const it of items) {
        if (!it.consumptions.length) {
          await tx.salesCost.create({
            data: {
              orderItemId: it.id,
              productId: it.productId,
              qtyProduct: it.qty,
              totalCost: new Prisma.Decimal(0),
              unitCost: new Prisma.Decimal(0),
              createdAt: new Date(),
            },
          });
          continue;
        }

        let totalCost = new Prisma.Decimal(0);
        for (const c of it.consumptions) {
          const unitCost = await this.getIngredientUnitCost(tx, c.ingredientId);
          totalCost = totalCost.plus(unitCost.mul(c.qtyIngredient));
        }
        const unitCostItem = it.qty > 0 ? totalCost.div(it.qty) : new Prisma.Decimal(0);

        await tx.salesCost.create({
          data: {
            orderItemId: it.id,
            productId: it.productId,
            qtyProduct: it.qty,
            totalCost,
            unitCost: unitCostItem,
            createdAt: new Date(),
          },
        });
      }
    });
  }
}
