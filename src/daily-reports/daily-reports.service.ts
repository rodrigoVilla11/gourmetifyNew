import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DailyReportsService {
  constructor(private prisma: PrismaService) {}

  async list(branchId: string, q: { accountId?: string; categoryId?: string; from?: string; to?: string }) {
    const where: any = { branchId };

    if (q.accountId) where.accountId = q.accountId;
    if (q.categoryId === 'null') where.categoryId = null;
    else if (q.categoryId) where.categoryId = q.categoryId;

    if (q.from || q.to) {
      where.date = {};
      if (q.from) where.date.gte = new Date(q.from);
      if (q.to)   where.date.lte = new Date(q.to);
    }

    return this.prisma.dailyReport.findMany({
      where,
      orderBy: [{ date: 'desc' }, { accountId: 'asc' }, { categoryId: 'asc' }],
      include: {
        account: { select: { id: true, name: true, type: true } },
        category: { select: { id: true, name: true, type: true } },
      },
    });
  }

  /**
   * Resumen agregado: suma ingresos/egresos/neto por rango/filtros
   */
  async summary(branchId: string, q: { accountId?: string; categoryId?: string; from?: string; to?: string }) {
    const where: any = { branchId };

    if (q.accountId) where.accountId = q.accountId;
    if (q.categoryId === 'null') where.categoryId = null;
    else if (q.categoryId) where.categoryId = q.categoryId;

    if (q.from || q.to) {
      where.date = {};
      if (q.from) where.date.gte = new Date(q.from);
      if (q.to)   where.date.lte = new Date(q.to);
    }

    const agg = await this.prisma.dailyReport.aggregate({
      where,
      _sum: { totalIncome: true, totalExpense: true, netTotal: true },
    });

    return {
      totalIncome: agg._sum.totalIncome ?? 0,
      totalExpense: agg._sum.totalExpense ?? 0,
      netTotal: agg._sum.netTotal ?? 0,
    };
  }
}
