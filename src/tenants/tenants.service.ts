import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto, TenantPlan, TenantStatus } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTenantDto) {
    const now = new Date();
    return this.prisma.tenant.create({
      data: { name: dto.name, plan: dto.plan, status: dto.status, createdAt: now, updatedAt: now },
    });
  }

  findAll() { return this.prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } }); }

  async findOne(id: string) {
    const t = await this.prisma.tenant.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Tenant not found');
    return t;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    return this.prisma.tenant.update({ where: { id }, data: { ...dto, updatedAt: new Date() } });
  }

  async remove(id: string) {
    // Si querés soft delete, cambia por deletedAt
    await this.findOne(id);
    return this.prisma.tenant.delete({ where: { id } });
  }
}
