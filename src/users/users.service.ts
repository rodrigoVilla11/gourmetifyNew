import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateUserDto) {
    // email único por tenant
    const exists = await this.prisma.user.findFirst({ where: { tenantId, email: dto.email } });
    if (exists) throw new BadRequestException('Email already exists for tenant');

    // si viene branchId, validar que pertenezca al tenant
    if (dto.branchId) {
      const b = await this.prisma.branch.findFirst({ where: { id: dto.branchId, tenantId } });
      if (!b) throw new BadRequestException('branchId does not belong to tenant');
    }

    const now = new Date();
    const hash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        tenantId,
        branchId: dto.branchId ?? null,
        name: dto.name,
        email: dto.email,
        password: hash,
        role: dto.role,
        isActive: dto.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true, branchId: true, tenantId: true, createdAt: true },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: { id: true, name: true, email: true, role: true, isActive: true, branchId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const u = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: { id: true, name: true, email: true, role: true, isActive: true, branchId: true, createdAt: true, updatedAt: true },
    });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(tenantId, id);

    if (dto.email) {
      const dup = await this.prisma.user.findFirst({ where: { tenantId, email: dto.email, NOT: { id } } });
      if (dup) throw new BadRequestException('Email already in use for tenant');
    }

    if (dto.branchId !== undefined && dto.branchId !== null) {
      const b = await this.prisma.branch.findFirst({ where: { id: dto.branchId, tenantId } });
      if (!b) throw new BadRequestException('branchId does not belong to tenant');
    }

    const data: any = { ...dto, updatedAt: new Date() };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true, branchId: true, createdAt: true, updatedAt: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.user.delete({ where: { id } });
  }
}