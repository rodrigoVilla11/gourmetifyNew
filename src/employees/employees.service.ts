// src/employees/employees.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto, AddRateDto } from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEmployeeDto) {
    const user = await this.prisma.user.findFirst({ where: { id: dto.userId, tenantId } });
    if (!user) throw new BadRequestException('userId does not belong to tenant');
    const exists = await this.prisma.employee.findUnique({ where: { userId: dto.userId } });
    if (exists) throw new BadRequestException('Employee already exists for user');

    return this.prisma.employee.create({
      data: {
        userId: dto.userId,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async addRate(tenantId: string, dto: AddRateDto) {
    const emp = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, user: { tenantId } },
    });
    if (!emp) throw new NotFoundException('Employee not found');

    return this.prisma.employeeRate.create({
      data: {
        employeeId: dto.employeeId,
        hourlyRate: new Prisma.Decimal(dto.hourlyRate),
        validFrom: new Date(dto.validFrom),
        validTo: dto.validTo ? new Date(dto.validTo) : null,
        createdAt: new Date(),
      },
    });
  }

  list(tenantId: string) {
    return this.prisma.employee.findMany({
      where: { user: { tenantId } },
      include: { user: true, rates: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
