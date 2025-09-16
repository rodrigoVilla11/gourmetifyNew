// src/finance/finance.service.ts
import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Ajusta el saldo de una cuenta (crea AccountBalance si no existe).
   */
  async adjustAccountBalance(tx: PrismaClient | Prisma.TransactionClient, accountId: string, delta: Prisma.Decimal | number) {
    const now = new Date();
    const current = await tx.accountBalance.findUnique({ where: { accountId } });
    if (!current) {
      return tx.accountBalance.create({
        data: { accountId, balance: new Prisma.Decimal(delta), updatedAt: now },
      });
    }
    return tx.accountBalance.update({
      where: { accountId },
      data: { balance: current.balance.plus(delta), updatedAt: now },
    });
  }

  /**
   * Actualiza (upsert) daily_reports.
   * Pasa incomeDelta en + para ingresos, expenseDelta en + para egresos.
   */
  async upsertDailyReport(
    tx: PrismaClient | Prisma.TransactionClient,
    branchId: string,
    accountId: string,
    categoryId: string | null,
    date: Date,
    incomeDelta: Prisma.Decimal | number,
    expenseDelta: Prisma.Decimal | number,
  ) {
    // Normalizamos a 00:00
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const key = { branchId_accountId_categoryId_date: { branchId, accountId, categoryId, date: d } };
    const current = await tx.dailyReport.findUnique({ where: key }).catch(() => null);

    const income = new Prisma.Decimal(incomeDelta || 0);
    const expense = new Prisma.Decimal(expenseDelta || 0);
    const net = income.minus(expense);

    if (!current) {
      return tx.dailyReport.create({
        data: {
          branchId, accountId, categoryId, date: d,
          totalIncome: income, totalExpense: expense, netTotal: net,
          createdAt: new Date(), updatedAt: new Date(),
        },
      });
    }
    return tx.dailyReport.update({
      where: key,
      data: {
        totalIncome: current.totalIncome.plus(income),
        totalExpense: current.totalExpense.plus(expense),
        netTotal: current.netTotal.plus(net),
        updatedAt: new Date(),
      },
    });
  }
}
