// src/customer-tags/customer-tags.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerTagDto, UpdateCustomerTagDto } from './dto/create-customer-tag.dto';

@Injectable()
export class CustomerTagsService {
  constructor(private prisma: PrismaService) {}

  async create(branchId: string, dto: CreateCustomerTagDto) {
    const dup = await this.prisma.customerTag.findFirst({ where: { branchId, name: dto.name } });
    if (dup) throw new BadRequestException('Tag already exists for branch');
    const now = new Date();
    return this.prisma.customerTag.create({ data: { branchId, name: dto.name, color: dto.color ?? null, createdAt: now, updatedAt: now } });
  }

  list(branchId: string) {
    return this.prisma.customerTag.findMany({ where: { branchId }, orderBy: { name: 'asc' } });
  }

  async update(branchId: string, id: string, dto: UpdateCustomerTagDto) {
    const row = await this.prisma.customerTag.findFirst({ where: { id, branchId } });
    if (!row) throw new NotFoundException('Tag not found');
    return this.prisma.customerTag.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });
  }

  async remove(branchId: string, id: string) {
    await this.update(branchId, id, {}); // verifica existencia
    return this.prisma.customerTag.delete({ where: { id } });
  }
}
