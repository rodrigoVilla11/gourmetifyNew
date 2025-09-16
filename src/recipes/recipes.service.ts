// src/recipes/recipes.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertRecipeDto } from './dto/create-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async upsert(branchId: string, dto: UpsertRecipeDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, branchId },
      include: { recipe: { include: { items: true } } },
    });
    if (!product) throw new BadRequestException('productId does not belong to branch');

    // Validar unidades
    for (const it of dto.items) {
      const ing = await this.prisma.ingredient.findFirst({ where: { id: it.ingredientId, branchId }});
      if (!ing) throw new BadRequestException(`ingredient ${it.ingredientId} does not belong to branch`);
      if (ing.unit !== (it.unit as any)) throw new BadRequestException(`unit mismatch for ingredient ${ing.name}`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Crear/asegurar recipe
      const recipe = product.recipe
        ? await tx.recipe.update({ where: { id: product.recipe.id }, data: { updatedAt: new Date() }})
        : await tx.recipe.create({ data: { productId: product.id, notes: null, createdAt: new Date(), updatedAt: new Date() }});

      // Reemplazar items
      await tx.recipeItem.deleteMany({ where: { recipeId: recipe.id }});
      await tx.recipeItem.createMany({
        data: dto.items.map((i) => ({
          recipeId: recipe.id,
          ingredientId: i.ingredientId,
          qtyPerUnit: new Prisma.Decimal(i.qtyPerUnit),
          unit: i.unit as any,
        })),
      });

      return tx.recipe.findUnique({ where: { id: recipe.id }, include: { items: true }});
    });
  }

  getByProduct(branchId: string, productId: string) {
    return this.prisma.recipe.findFirst({ where: { productId, product: { branchId } }, include: { items: true }});
  }
}
