// src/employee-shifts/employee-shifts.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CheckInDto, CheckOutDto } from './dto/shift.dto';

@Injectable()
export class EmployeeShiftsService {
  constructor(private prisma: PrismaService) {}

  private async getRateForDate(employeeId: string, at: Date) {
    // último rate con validFrom <= at y (validTo >= at o null)
    const rate = await this.prisma.employeeRate.findFirst({
      where: {
        employeeId,
        validFrom: { lte: at },
        OR: [{ validTo: null }, { validTo: { gte: at } }],
      },
      orderBy: { validFrom: 'desc' },
    });
    return rate;
  }

  async checkIn(dto: CheckInDto) {
    const emp = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId },
      include: { user: { select: { branchId: true } } },
    });
    if (!emp) throw new NotFoundException('Employee not found');

    // validar que el check-in sea en la misma branch del usuario (si querés)
    if (emp.user?.branchId && emp.user.branchId !== dto.branchId) {
      throw new BadRequestException('Employee is not assigned to this branch');
    }

    const at = new Date(dto.checkIn);
    const rate = await this.getRateForDate(dto.employeeId, at);
    if (!rate) throw new BadRequestException('No rate defined for this date');

    return this.prisma.employeeShift.create({
      data: {
        employeeId: dto.employeeId,
        branchId: dto.branchId,
        checkIn: at,
        status: 'WORKED',
        hourlyRate: rate.hourlyRate,
        totalHours: new Prisma.Decimal(0),
        totalPay: new Prisma.Decimal(0),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async checkOut(dto: CheckOutDto) {
    const shift = await this.prisma.employeeShift.findUnique({
      where: { id: dto.shiftId },
    });
    if (!shift) throw new NotFoundException('Shift not found');
    if (shift.checkOut) throw new BadRequestException('Shift already closed');

    const out = new Date(dto.checkOut);
    if (out <= shift.checkIn)
      throw new BadRequestException('checkOut must be after checkIn');

    const hours = (out.getTime() - shift.checkIn.getTime()) / (1000 * 60 * 60);
    const totalHours = new Prisma.Decimal(hours.toFixed(2));
    const totalPay = totalHours.mul(shift.hourlyRate);

    return this.prisma.employeeShift.update({
      where: { id: shift.id },
      data: {
        checkOut: out,
        totalHours,
        totalPay,
        updatedAt: new Date(),
      },
    });
  }

  listByEmployee(employeeId: string) {
    return this.prisma.employeeShift.findMany({
      where: { employeeId },
      orderBy: { checkIn: 'desc' },
    });
  }
}
