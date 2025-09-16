// src/movements/movements.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import {
  CreateMovementDto,
  UpdateMovementDto,
  MovementType,
} from './dto/create-movement.dto';

@Injectable()
export class MovementsService {
  constructor(
    private prisma: PrismaService,
    private finance: FinanceService,
  ) {}

  private isIncome(t: MovementType) {
    return (
      t === MovementType.SALE ||
      t === MovementType.INCOME_OTHER ||
      t === MovementType.TRANSFER_IN
    );
  }
  private isExpense(t: MovementType) {
    return (
      t === MovementType.SUPPLIER_PAYMENT ||
      t === MovementType.EXPENSE_GENERAL ||
      t === MovementType.TRANSFER_OUT ||
      t === MovementType.ADJUSTMENT
    );
  }

  /**
   * Crea un movimiento y actualiza saldos + reporte diario en una transacción.
   * Nota: si vas a usar AccountTransfer, evitá TRANSFER_IN/OUT acá para no duplicar.
   */
  async create(branchId: string, dto: CreateMovementDto) {
    const account = await this.prisma.account.findFirst({
      where: { id: dto.accountId, branchId },
    });
    if (!account)
      throw new BadRequestException('accountId does not belong to branch');

    if (dto.categoryId) {
      const cat = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, branchId },
      });
      if (!cat)
        throw new BadRequestException('categoryId does not belong to branch');
    }

    const date = new Date(dto.date);
    if (Number.isNaN(date.getTime()))
      throw new BadRequestException('Invalid date');
    if (dto.amount <= 0)
      throw new BadRequestException('Amount must be positive');

    const amount = new Prisma.Decimal(dto.amount);
    const income = this.isIncome(dto.type);
    const expense = this.isExpense(dto.type);
    if (!income && !expense)
      throw new BadRequestException('Invalid movement type');

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.movement.create({
        data: {
          accountId: dto.accountId,
          categoryId: dto.categoryId ?? null,
          supplierId: dto.supplierId ?? null,
          userId: dto.userId,
          date,
          type: dto.type as any,
          amount,
          description: dto.description ?? null,
          documentUrl: dto.documentUrl ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Ajuste de saldo
      await this.finance.adjustAccountBalance(
        tx,
        dto.accountId,
        income ? amount : amount.negated(),
      );

      // Reporte diario
      await this.finance.upsertDailyReport(
        tx,
        branchId,
        dto.accountId,
        dto.categoryId ?? null,
        date,
        income ? amount : 0,
        expense ? amount : 0,
      );

      return created;
    });
  }

  listByDate(branchId: string, from: string, to: string) {
    const start = new Date(from);
    const end = new Date(to);
    return this.prisma.movement.findMany({
      where: { account: { branchId }, date: { gte: start, lt: end } },
      orderBy: { date: 'desc' },
    });
  }

  async detail(branchId: string, id: string) {
    const row = await this.prisma.movement.findFirst({
      where: { id, account: { branchId } },
    });
    if (!row) throw new NotFoundException('Movement not found');
    return row;
  }

  /**
   * Actualizar movimiento (opcional, no ajusta saldo histórico).
   * En la práctica es mejor bloquear edición después de cierre/corte.
   */
  async update(branchId: string, id: string, dto: UpdateMovementDto) {
    // valida que el movement pertenezca al branch (vía account.branchId)
    const row = await this.prisma.movement.findFirst({
      where: { id, account: { branchId } },
      select: { id: true },
    });
    if (!row) throw new NotFoundException('Movement not found');

    const data: Prisma.MovementUpdateInput = {
      updatedAt: new Date(),
    };

    // Relaciones: usar nested writes
    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }

    if (dto.supplierId !== undefined) {
      data.supplier = dto.supplierId
        ? { connect: { id: dto.supplierId } }
        : { disconnect: true };
    }

    // Escalares
    if (dto.date !== undefined) {
      const d = new Date(dto.date);
      if (Number.isNaN(d.getTime()))
        throw new BadRequestException('Invalid date');
      data.date = d;
    }

    if (dto.type !== undefined) data.type = dto.type as any;

    if (dto.amount !== undefined) {
      if (dto.amount <= 0)
        throw new BadRequestException('Amount must be positive');
      data.amount = new Prisma.Decimal(dto.amount);
    }

    if (dto.description !== undefined) data.description = dto.description;
    if (dto.documentUrl !== undefined) data.documentUrl = dto.documentUrl;

    return this.prisma.movement.update({ where: { id }, data });
  }

  async remove(branchId: string, id: string) {
    const row = await this.detail(branchId, id);
    // Si querés revertir saldos/reportes al borrar, hacelo aquí (recomendado solo si no hay cierres)
    return this.prisma.movement.delete({ where: { id: row.id } });
  }
}
