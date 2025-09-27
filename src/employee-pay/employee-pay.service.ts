// src/employee-pay/employee-pay.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, BonusType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdvanceDto, BonusDto } from './dto/ab.dto';

@Injectable()
export class EmployeePayService {
  constructor(private prisma: PrismaService) {}

  async addAdvance(d: AdvanceDto) {
    const emp = await this.prisma.employee.findUnique({ where: { id: d.employeeId } });
    if (!emp) throw new NotFoundException('Employee not found');
    return this.prisma.employeeAdvance.create({
      data: {
        employeeId: d.employeeId,
        branchId: d.branchId,
        date: new Date(d.date),
        amount: new Prisma.Decimal(d.amount),
        description: d.description ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async addBonus(d: BonusDto) {
    const emp = await this.prisma.employee.findUnique({ where: { id: d.employeeId } });
    if (!emp) throw new NotFoundException('Employee not found');
    return this.prisma.employeeBonus.create({
      data: {
        employeeId: d.employeeId,
        branchId: d.branchId,
        date: new Date(d.date),
        type: d.type as BonusType,
        amount: new Prisma.Decimal(d.amount),
        description: d.description ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
