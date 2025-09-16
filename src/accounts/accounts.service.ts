// src/accounts/accounts.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(branchId: string, dto: CreateAccountDto) {
    const exists = await this.prisma.account.findFirst({ where: { branchId, name: dto.name } });
    if (exists) throw new BadRequestException('Account name already exists for branch');

    const now = new Date();
    return this.prisma.account.create({
      data: {
        branchId,
        name: dto.name,
        type: dto.type,
        isActive: dto.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  findAll(branchId: string) {
    return this.prisma.account.findMany({ where: { branchId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(branchId: string, id: string) {
    const acc = await this.prisma.account.findFirst({ where: { id, branchId } });
    if (!acc) throw new NotFoundException('Account not found');
    return acc;
  }

  async update(branchId: string, id: string, dto: UpdateAccountDto) {
    await this.findOne(branchId, id);
    return this.prisma.account.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });
  }

  async remove(branchId: string, id: string) {
    await this.findOne(branchId, id);
    return this.prisma.account.delete({ where: { id } });
  }
}
