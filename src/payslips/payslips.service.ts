// src/payslips/payslips.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GeneratePayslipDto } from './dto/payslip.dto';

@Injectable()
export class PayslipsService {
  constructor(private prisma: PrismaService) {}

  private range(month: number, year: number) {
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    return { start, end };
  }

  async generate(d: GeneratePayslipDto) {
    const emp = await this.prisma.employee.findUnique({
      where: { id: d.employeeId },
      include: { user: { select: { branchId: true } } },
    });
    if (!emp) throw new BadRequestException('Employee not found');

    const branchId = emp.user?.branchId;
    if (!branchId)
      throw new BadRequestException('Employee user has no branch assigned');
    if (!emp) throw new BadRequestException('Employee not found');

    const { start, end } = this.range(d.periodMonth, d.periodYear);

    // horas y pagos por shifts en el período
    const shifts = await this.prisma.employeeShift.findMany({
      where: { employeeId: d.employeeId, checkIn: { gte: start, lt: end } },
      select: { totalHours: true, totalPay: true },
    });

    const baseHours = shifts.reduce((acc, s) => acc + Number(s.totalHours), 0);
    const basePay = shifts.reduce((acc, s) => acc + Number(s.totalPay), 0);

    // bonuses & tips
    const bonuses = await this.prisma.employeeBonus.aggregate({
      where: { employeeId: d.employeeId, date: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    const bonusesTotal = Number(bonuses._sum.amount ?? 0);

    // advances
    const advances = await this.prisma.employeeAdvance.aggregate({
      where: { employeeId: d.employeeId, date: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    const advancesTotal = Number(advances._sum.amount ?? 0);

    const tipsTotal = 0; // si querés separar TIP del enum, podés sumar sólo type='TIP'
    const finalAmount = basePay + bonusesTotal + tipsTotal - advancesTotal;

    return this.prisma.employeePayslip.create({
      data: {
        employeeId: d.employeeId,
        branchId, 
        periodMonth: d.periodMonth,
        periodYear: d.periodYear,
        baseHours: new Prisma.Decimal(baseHours.toFixed(2)),
        basePay: new Prisma.Decimal(basePay.toFixed(2)),
        bonusesTotal: new Prisma.Decimal(bonusesTotal.toFixed(2)),
        tipsTotal: new Prisma.Decimal(tipsTotal.toFixed(2)),
        advancesTotal: new Prisma.Decimal(advancesTotal.toFixed(2)),
        finalAmount: new Prisma.Decimal(finalAmount.toFixed(2)),
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
