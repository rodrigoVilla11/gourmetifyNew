// src/cash-closures/cash-closures.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCashClosureDto } from './dto/create-cash-closure.dto';

@Injectable()
export class CashClosuresService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cierra un día: trae movimientos del día para la cuenta, calcula totales y diferencia.
   * No modifica saldos; deja registro para auditoría.
   */
  async create(branchId: string, dto: CreateCashClosureDto) {
    const account = await this.prisma.account.findFirst({ where: { id: dto.accountId, branchId } });
    if (!account) throw new BadRequestException('accountId does not belong to branch');

    const day = new Date(dto.date);
    const start = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));
    const end = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate() + 1));

    // Totales del día
    const moves = await this.prisma.movement.findMany({
      where: { accountId: dto.accountId, date: { gte: start, lt: end } },
      select: { type: true, amount: true },
    });

    // Clasificación simple (coincide con MovementsService)
    const isIncome = (t: any) => ['SALE','INCOME_OTHER','TRANSFER_IN'].includes(t);
    const isExpense = (t: any) => ['SUPPLIER_PAYMENT','EXPENSE_GENERAL','TRANSFER_OUT','ADJUSTMENT'].includes(t);

    let totalIncome = 0, totalExpense = 0;
    for (const m of moves) {
      if (isIncome(m.type)) totalIncome += Number(m.amount);
      if (isExpense(m.type)) totalExpense += Number(m.amount);
    }

    const closingExpected = dto.openingBalance + totalIncome - totalExpense;
    const difference = dto.realBalance - closingExpected;

    return this.prisma.cashClosure.create({
      data: {
        branchId,
        accountId: dto.accountId,
        userId: dto.userId,
        date: start,
        openingBalance: dto.openingBalance,
        totalIncome,
        totalExpense,
        closingBalance: closingExpected,
        realBalance: dto.realBalance,
        difference,
        createdAt: new Date(),
      },
    });
  }

  list(branchId: string, accountId: string, from: string, to: string) {
    const start = new Date(from);
    const end = new Date(to);
    return this.prisma.cashClosure.findMany({
      where: { branchId, accountId, date: { gte: start, lt: end } },
      orderBy: { date: 'desc' },
    });
  }
}
