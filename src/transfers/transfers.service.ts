// src/transfers/transfers.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Injectable()
export class TransfersService {
  constructor(private prisma: PrismaService, private finance: FinanceService) {}

  async create(branchId: string, dto: CreateTransferDto) {
    if (dto.amount <= 0) throw new BadRequestException('Amount must be positive');
    if (dto.fromAccountId === dto.toAccountId) throw new BadRequestException('Accounts must be different');
    const [from, to] = await Promise.all([
      this.prisma.account.findFirst({ where: { id: dto.fromAccountId, branchId } }),
      this.prisma.account.findFirst({ where: { id: dto.toAccountId, branchId } }),
    ]);
    if (!from || !to) throw new BadRequestException('Account does not belong to branch');

    const date = new Date(dto.date);
    const amount = new Prisma.Decimal(dto.amount);

    return this.prisma.$transaction(async (tx: PrismaClient | any) => {
      const created = await tx.accountTransfer.create({
        data: {
          fromAccountId: dto.fromAccountId,
          toAccountId: dto.toAccountId,
          amount, date,
          description: dto.description ?? null,
          userId: dto.userId,
          createdAt: new Date(),
        },
      });

      // Saldos
      await this.finance.adjustAccountBalance(tx, dto.fromAccountId, amount.negated());
      await this.finance.adjustAccountBalance(tx, dto.toAccountId, amount);

      // Reportes diarios (sin categoría)
      await this.finance.upsertDailyReport(tx, branchId, dto.fromAccountId, null, date, 0, amount); // egreso
      await this.finance.upsertDailyReport(tx, branchId, dto.toAccountId, null, date, amount, 0);   // ingreso

      return created;
    });
  }

  list(branchId: string, from: string, to: string) {
    const start = new Date(from);
    const end = new Date(to);
    return this.prisma.accountTransfer.findMany({
      where: {
        OR: [
          { fromAccount: { branchId } },
          { toAccount: { branchId } },
        ],
        date: { gte: start, lt: end },
      },
      orderBy: { date: 'desc' },
    });
  }
}
