// src/order-items/order-items.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';

@Injectable()
export class OrderItemsService {
  constructor(private prisma: PrismaService) {}

  async add(branchId: string, dto: CreateOrderItemDto) {
    const order = await this.prisma.orders.findFirst({ where: { id: dto.orderId, branchId } });
    if (!order) throw new BadRequestException('orderId does not belong to branch');
    if (order.status === 'DELIVERED') throw new BadRequestException('Cannot add items to delivered order');

    const product = await this.prisma.product.findFirst({ where: { id: dto.productId, branchId } });
    if (!product) throw new BadRequestException('productId does not belong to branch');

    const unitPrice = new Prisma.Decimal(product.price);
    const subtotal = unitPrice.mul(dto.qty);

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.create({
        data: {
          orderId: dto.orderId,
          productId: dto.productId,
          qty: dto.qty,
          unitPrice,
          discount: new Prisma.Decimal(0),
          subtotal,
          createdAt: new Date(),
        },
      });

      const { _sum } = await tx.orderItem.aggregate({
        where: { orderId: dto.orderId },
        _sum: { subtotal: true, discount: true },
      });
      const subtotalSum = _sum.subtotal ?? new Prisma.Decimal(0);
      const discountSum = _sum.discount ?? new Prisma.Decimal(0);
      const total = subtotalSum.minus(discountSum);

      await tx.orders.update({
        where: { id: dto.orderId },
        data: { subtotal: subtotalSum, discountTotal: discountSum, total, updatedAt: new Date() },
      });

      return item;
    });
  }

  async remove(branchId: string, id: string) {
    const it = await this.prisma.orderItem.findFirst({ where: { id, orders: { branchId } }, include: { orders: true } });
    if (!it) throw new BadRequestException('Item not found');
    if (it.orders.status === 'DELIVERED') throw new BadRequestException('Cannot remove item from delivered order');

    return this.prisma.$transaction(async (tx) => {
      await tx.orderItem.delete({ where: { id } });
      const { _sum } = await tx.orderItem.aggregate({
        where: { orderId: it.orderId },
        _sum: { subtotal: true, discount: true },
      });
      const subtotalSum = _sum.subtotal ?? new Prisma.Decimal(0);
      const discountSum = _sum.discount ?? new Prisma.Decimal(0);
      const total = subtotalSum.minus(discountSum);
      await tx.orders.update({
        where: { id: it.orderId },
        data: { subtotal: subtotalSum, discountTotal: discountSum, total, updatedAt: new Date() },
      });
      return { ok: true };
    });
  }
}
