// src/customer-addresses/customer-addresses.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerAddressDto, UpdateCustomerAddressDto } from './dto/create-customer-address.dto';

@Injectable()
export class CustomerAddressesService {
  constructor(private prisma: PrismaService) {}

  async create(branchId: string, dto: CreateCustomerAddressDto) {
    const customer = await this.prisma.customer.findFirst({ where: { id: dto.customerId, branchId } });
    if (!customer) throw new BadRequestException('customerId does not belong to branch');

    const created = await this.prisma.customerAddress.create({
      data: { ...dto, isDefault: dto.isDefault ?? false, createdAt: new Date(), updatedAt: new Date() },
    });

    if (dto.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId: dto.customerId, NOT: { id: created.id } },
        data: { isDefault: false },
      });
    }

    return created;
  }

  list(branchId: string, customerId: string) {
    return this.prisma.customerAddress.findMany({
      where: { customerId, customer: { branchId } },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async update(branchId: string, id: string, dto: UpdateCustomerAddressDto) {
    const addr = await this.prisma.customerAddress.findFirst({ where: { id, customer: { branchId } } });
    if (!addr) throw new NotFoundException('Address not found');

    const updated = await this.prisma.customerAddress.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });

    if (dto.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId: updated.customerId, NOT: { id: updated.id } },
        data: { isDefault: false },
      });
    }

    return updated;
  }

  async remove(branchId: string, id: string) {
    const addr = await this.prisma.customerAddress.findFirst({ where: { id, customer: { branchId } } });
    if (!addr) throw new NotFoundException('Address not found');
    return this.prisma.customerAddress.delete({ where: { id } });
  }
}
