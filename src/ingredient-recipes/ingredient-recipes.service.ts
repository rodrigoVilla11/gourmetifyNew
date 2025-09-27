import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, UnitType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertIngredientRecipeDto } from './dto/ingredient-recipe.dto';

@Injectable()
export class IngredientRecipesService {
  constructor(private prisma: PrismaService) {}

  async upsert(branchId: string, dto: UpsertIngredientRecipeDto) {
    // 1) Validar ingrediente preparado (pertenencia + kind PREPARED)
    const prepared = await this.prisma.ingredient.findFirst({
      where: { id: dto.preparedIngredientId, branchId },
      select: { id: true, name: true, kind: true, unit: true },
    });
    if (!prepared) throw new BadRequestException('preparedIngredientId does not belong to branch');
    if (prepared.kind !== 'PREPARED') throw new BadRequestException('preparedIngredientId must be of kind PREPARED');

    // 2) Validar items: pertenencia + unidad
    for (const it of dto.items) {
      const ing = await this.prisma.ingredient.findFirst({
        where: { id: it.ingredientId, branchId },
        select: { id: true, name: true, unit: true },
      });
      if (!ing) throw new BadRequestException(`ingredient ${it.ingredientId} does not belong to branch`);
      if (ing.unit !== (it.unit as UnitType)) {
        throw new BadRequestException(`unit mismatch for ingredient ${ing.name}`);
      }
      if (it.qtyPerUnit <= 0) {
        throw new BadRequestException(`qtyPerUnit must be positive for ingredient ${ing.name}`);
      }
    }

    // 3) Upsert transaccional: asegurar IngredientRecipe y reemplazar items
    return this.prisma.$transaction(async (tx) => {
      // Existe?
      let recipe = await tx.ingredientRecipe.findFirst({
        where: { preparedIngredientId: prepared.id },
        select: { id: true },
      });

      const now = new Date();
      if (!recipe) {
        recipe = await tx.ingredientRecipe.create({
          data: {
            preparedIngredientId: prepared.id,
            notes: dto.notes ?? null,
            createdAt: now,
            updatedAt: now,
          },
          select: { id: true },
        });
      } else {
        await tx.ingredientRecipe.update({
          where: { id: recipe.id },
          data: { notes: dto.notes ?? null, updatedAt: now },
        });
      }

      // Reemplazar items
      await tx.ingredientRecipeItem.deleteMany({ where: { ingredientRecipeId: recipe.id } });
      if (dto.items.length > 0) {
        await tx.ingredientRecipeItem.createMany({
          data: dto.items.map((i) => ({
            ingredientRecipeId: recipe!.id,
            ingredientId: i.ingredientId,
            qtyPerUnit: new Prisma.Decimal(i.qtyPerUnit),
            unit: i.unit as any,
          })),
        });
      }

      return tx.ingredientRecipe.findUnique({
        where: { id: recipe.id },
        include: {
          preparedIngredient: true,
          items: { include: { ingredient: true } },
        },
      });
    });
  }

  async getByPreparedIngredient(branchId: string, preparedIngredientId: string) {
    // Validamos pertenencia
    const prepared = await this.prisma.ingredient.findFirst({
      where: { id: preparedIngredientId, branchId },
      select: { id: true },
    });
    if (!prepared) throw new BadRequestException('preparedIngredientId does not belong to branch');

    return this.prisma.ingredientRecipe.findFirst({
      where: { preparedIngredientId },
      include: { preparedIngredient: true, items: { include: { ingredient: true } } },
    });
  }

  listByBranch(branchId: string) {
    return this.prisma.ingredientRecipe.findMany({
      where: { preparedIngredient: { branchId } },
      orderBy: { updatedAt: 'desc' },
      include: {
        preparedIngredient: true,
        items: { include: { ingredient: true } },
      },
    });
  }
}
