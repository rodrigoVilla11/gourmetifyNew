// src/production-batches/production-batches.service.ts (fragmento clave)
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionBatchDto } from './dto/production-batch.dto';

@Injectable()
export class ProductionBatchesService {
  constructor(private prisma: PrismaService) {}

  async createCompleted(branchId: string, dto: CreateProductionBatchDto) {
    const recipe = await this.prisma.ingredientRecipe.findFirst({
      where: { id: dto.ingredientRecipeId },
      include: {
        preparedIngredient: true,
        items: { include: { ingredient: true } },
      },
    });
    if (!recipe) throw new NotFoundException('IngredientRecipe not found');
    if (!recipe.preparedIngredient) throw new BadRequestException('Recipe has no preparedIngredient');
    if (recipe.preparedIngredient.branchId !== branchId) throw new BadRequestException('Recipe not in branch');
    if (!recipe.items.length) throw new BadRequestException('Recipe has no items');

    const producedAt = dto.producedAt ? new Date(dto.producedAt) : new Date();
    const outputQty = new Prisma.Decimal(dto.outputQty);
    const preparedUnit = recipe.preparedIngredient.unit;

    type Row = {
      ingredientId: string;
      unit: any;
      qtyUsed: Prisma.Decimal;
      unitCost: Prisma.Decimal; // cost en tu tabla
    };

    const rows: Row[] = [];
    let totalInputCost = new Prisma.Decimal(0);

    // Precalcular unidades, costos y stock
    for (const ri of recipe.items) {
      if (ri.unit !== ri.ingredient.unit) {
        throw new BadRequestException(`Unit mismatch for ingredient ${ri.ingredient.name}`);
      }
      const qtyUsed = new Prisma.Decimal(ri.qtyPerUnit).mul(outputQty);

      // costo unitario del insumo
      const unitCost = await this.getIngredientUnitCost(this.prisma, ri.ingredientId);

      // verificar stock
      const inv = await this.prisma.inventoryItem.findUnique({ where: { ingredientId: ri.ingredientId } });
      if (!inv) throw new BadRequestException(`No inventory for ingredient ${ri.ingredient.name}`);
      if (inv.qty.lessThan(qtyUsed)) {
        throw new BadRequestException(
          `Insufficient stock for ingredient ${ri.ingredient.name}: need ${qtyUsed.toString()}, have ${inv.qty.toString()}`
        );
      }

      totalInputCost = totalInputCost.plus(unitCost.mul(qtyUsed));
      rows.push({ ingredientId: ri.ingredientId, unit: ri.unit, qtyUsed, unitCost });
    }

    const unitCostBatch = outputQty.greaterThan(0) ? totalInputCost.div(outputQty) : new Prisma.Decimal(0);

    // Transacción
    return this.prisma.$transaction(async (tx) => {
      // a) Crear batch con totales ya calculados
      const batch = await tx.productionBatch.create({
        data: {
          ingredientRecipeId: recipe.id,
          branchId,
          outputQty,
          unit: preparedUnit,
          producedAt,
          createdBy: dto.createdByUserId,
          totalInputCost,
          unitCost: unitCostBatch,
        },
      });

      // b) Registrar consumos y descontar inventario (usa productionBatchId + qtyUsed + cost)
      for (const r of rows) {
        await tx.productionBatchConsumption.create({
          data: {
            productionBatchId: batch.id,    // 👈 tu FK real
            ingredientId: r.ingredientId,
            qtyUsed: r.qtyUsed,             // 👈 nombre real
            unit: r.unit,
            cost: r.unitCost,               // 👈 costo unitario
          },
        });

        const inv = await tx.inventoryItem.findUnique({ where: { ingredientId: r.ingredientId } });
        await tx.inventoryItem.update({
          where: { ingredientId: r.ingredientId },
          data: { qty: inv!.qty.minus(r.qtyUsed) },
        });
      }

      // c) Sumar inventario del preparado
      const invPrep = await tx.inventoryItem.findUnique({ where: { ingredientId: recipe.preparedIngredientId } });
      if (!invPrep) {
        await tx.inventoryItem.create({
          data: {
            branchId,
            ingredientId: recipe.preparedIngredientId,
            unit: preparedUnit,
            qty: outputQty,
            minQty: new Prisma.Decimal(0),
          },
        });
      } else {
        await tx.inventoryItem.update({
          where: { ingredientId: recipe.preparedIngredientId },
          data: { qty: invPrep.qty.plus(outputQty) },
        });
      }

      return tx.productionBatch.findUnique({
        where: { id: batch.id },
        include: {
          ingredientRecipe: { include: { preparedIngredient: true } },
          consumptions: { include: { ingredient: true } },
        },
      });
    });
  }

  // unit cost helper (igual que antes, devuelve costo unitario del insumo)
  private async getIngredientUnitCost(tx: PrismaClient | any, ingredientId: string): Promise<Prisma.Decimal> {
    const ing = await tx.ingredient.findUnique({ where: { id: ingredientId } });
    if (!ing) return new Prisma.Decimal(0);

    if ((ing as any).kind === 'PREPARED') {
      // último batch del mismo preparado
      const last = await tx.productionBatch.findFirst({
        where: { ingredientRecipe: { preparedIngredientId: ingredientId } },
        orderBy: { producedAt: 'desc' },
        select: { unitCost: true },
      });
      return last?.unitCost ?? new Prisma.Decimal(0);
    }

    // RAW: si tenés avgCost en inventoryItem, úsalo; si no, 0
    const inv = await tx.inventoryItem.findUnique({ where: { ingredientId } });
    if (inv && (inv as any).avgCost) return (inv as any).avgCost;
    return new Prisma.Decimal(0);
  }
}
