import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmailGlobal(email: string) {
    return this.prisma.user.findFirst({ where: { email } });
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const email = dto.email.toLowerCase();
    const branchId = dto.branchId?.trim() ? dto.branchId : null;

    // email único por tenant
    const exists = await this.prisma.user.findFirst({
      where: { tenantId, email },
    });
    if (exists)
      throw new BadRequestException('Email already exists for tenant');

    // validar branch pertenece al tenant
    if (branchId) {
      const b = await this.prisma.branch.findFirst({
        where: { id: branchId, tenantId },
      });
      if (!b)
        throw new BadRequestException('branchId does not belong to tenant');
    }

    const now = new Date();
    const hash = await bcrypt.hash(dto.password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          tenantId,
          branchId,
          name: dto.name,
          email,
          password: hash, // ideal: renombrar a passwordHash cuando migres
          role: dto.role as unknown as UserRole,
          isActive: dto.isActive ?? true,
          createdAt: now,
          updatedAt: now,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          branchId: true,
          tenantId: true,
          createdAt: true,
        },
      });
    } catch (e: any) {
      // P2002: unique constraint
      if (e?.code === 'P2002') {
        throw new BadRequestException('Email already exists for tenant');
      }
      throw e;
    }
  }

  // filtros/paginación opcionales
  findAll(
    tenantId: string,
    opts?: {
      q?: string;
      branchId?: string | null;
      isActive?: boolean;
      skip?: number;
      take?: number;
    },
  ) {
    const where: any = { tenantId };

    if (typeof opts?.isActive === 'boolean') where.isActive = opts.isActive;
    if (opts?.branchId === null) where.branchId = null;
    if (opts?.branchId) where.branchId = opts.branchId;
    if (opts?.q) {
      const q = opts.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        branchId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: opts?.skip ?? 0,
      take: Math.min(opts?.take ?? 50, 100),
    });
  }

  async findOne(tenantId: string, id: string) {
    const u = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        branchId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(tenantId, id);

    const patch: any = { updatedAt: new Date() };

    if (dto.email) {
      const email = dto.email.toLowerCase();
      const dup = await this.prisma.user.findFirst({
        where: { tenantId, email, NOT: { id } },
        select: { id: true },
      });
      if (dup) throw new BadRequestException('Email already in use for tenant');
      patch.email = email;
    }

    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.role !== undefined) patch.role = dto.role;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;

    if (dto.password) {
      patch.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.branchId !== undefined) {
      const branchId = dto.branchId?.trim() ? dto.branchId : null;
      if (branchId) {
        const b = await this.prisma.branch.findFirst({
          where: { id: branchId, tenantId },
          select: { id: true },
        });
        if (!b)
          throw new BadRequestException('branchId does not belong to tenant');
      }
      patch.branchId = branchId;
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: patch,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          branchId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new BadRequestException('Email already in use for tenant');
      }
      throw e;
    }
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.user.delete({
      where: { id },
      select: { id: true },
    });
  }
}
