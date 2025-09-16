// src/customers/customers.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(branchId: string, dto: CreateCustomerDto) {
    const dup = await this.prisma.customer.findFirst({ where: { branchId, email: dto.email } });
    if (dup) throw new BadRequestException('Email already exists for this branch');

    const now = new Date();
    return this.prisma.customer.create({
      data: {
        branchId, name: dto.name, email: dto.email, phone: dto.phone ?? null,
        marketingOptIn: dto.marketingOptIn ?? false,
        createdAt: now, updatedAt: now,
      },
    });
  }

  list(branchId: string) {
    return this.prisma.customer.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
      include: { addresses: true, tags: { include: { tag: true } } },
    });
  }

  async detail(branchId: string, id: string) {
    const row = await this.prisma.customer.findFirst({
      where: { id, branchId },
      include: { addresses: true, tags: { include: { tag: true } }, notes: { orderBy: { createdAt: 'desc' } } },
    });
    if (!row) throw new NotFoundException('Customer not found');
    return row;
  }

  async update(branchId: string, id: string, dto: UpdateCustomerDto) {
    await this.detail(branchId, id);
    if (dto.email) {
      const dup = await this.prisma.customer.findFirst({ where: { branchId, email: dto.email, NOT: { id } } });
      if (dup) throw new BadRequestException('Email already in use for this branch');
    }
    return this.prisma.customer.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });
  }

  async remove(branchId: string, id: string) {
    await this.detail(branchId, id);
    return this.prisma.customer.delete({ where: { id } });
  }
}
