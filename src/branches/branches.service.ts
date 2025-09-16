import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateBranchDto) {
    const now = new Date();
    // name único por tenant
    const exists = await this.prisma.branch.findFirst({ where: { tenantId, name: dto.name } });
    if (exists) throw new BadRequestException('Branch name already exists for tenant');
    return this.prisma.branch.create({
      data: { tenantId, name: dto.name, address: dto.address, phone: dto.phone, createdAt: now, updatedAt: now },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.branch.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(tenantId: string, id: string) {
    const b = await this.prisma.branch.findFirst({ where: { id, tenantId } });
    if (!b) throw new NotFoundException('Branch not found');
    return b;
  }

  async update(tenantId: string, id: string, dto: UpdateBranchDto) {
    await this.findOne(tenantId, id);
    return this.prisma.branch.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.branch.delete({ where: { id } });
  }
}