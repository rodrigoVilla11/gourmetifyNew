// src/order-payments/order-payments.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import { CreateOrderPaymentDto } from './dto/create-order-payment.dto';

@Injectable()
export class OrderPaymentsService {
  constructor(private prisma: PrismaService, private finance: FinanceService) {}

  async create(branchId: string, dto: CreateOrderPaymentDto) {
    const order = await this.prisma.orders.findFirst({ where: { id: dto.orderId, branchId } });
    if (!order) throw new BadRequestException('orderId does not belong to branch');
    const account = await this.prisma.account.findFirst({ where: { id: dto.accountId, branchId } });
    if (!account) throw new BadRequestException('accountId does not belong to branch');
    if (dto.amount <= 0) throw new BadRequestException('Amount must be positive');

    const amount = new Prisma.Decimal(dto.amount);
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const pay = await tx.orderPayment.create({
        data: { orderId: dto.orderId, accountId: dto.accountId, amount, note: dto.note ?? null, createdAt: now },
      });

      const paidAgg = await tx.orderPayment.aggregate({ where: { orderId: dto.orderId }, _sum: { amount: true } });
      const paid = paidAgg._sum.amount ?? new Prisma.Decimal(0);
      const total = new Prisma.Decimal(order.total);
      const paymentStatus =
        paid.greaterThan(0) && paid.lessThan(total)
          ? 'PARTIALLY_PAID'
          : paid.greaterThanOrEqualTo(total)
          ? 'PAID'
          : 'UNPAID';

      await tx.orders.update({ where: { id: order.id }, data: { paymentStatus: paymentStatus as any, updatedAt: now } });

      const movement = await tx.movement.create({
        data: {
          accountId: dto.accountId,
          categoryId: null,
          supplierId: null,
          userId: order.cashierId,
          date: now,
          type: 'SALE',
          amount,
          description: `Order ${order.id} payment`,
          documentUrl: null,
          createdAt: now,
          updatedAt: now,
        },
      });

      await this.finance.adjustAccountBalance(tx, dto.accountId, amount);
      await this.finance.upsertDailyReport(tx, branchId, dto.accountId, null, now, amount, 0);

      return { pay, movement, paymentStatus };
    });
  }

  list(branchId: string, orderId: string) {
    return this.prisma.orderPayment.findMany({
      where: { orderId, orders: { branchId } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
