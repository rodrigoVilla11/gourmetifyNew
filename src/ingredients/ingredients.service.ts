// src/ingredients/ingredients.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UnitType, IngredientKind } from '@prisma/client'; // 👈 agrega IngredientKind
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
} from './dto/create-ingredient.dto';

function normEnum<T extends string>(v: any): T {
  return String(v ?? '')
    .trim()
    .toUpperCase() as T;
}

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  async create(branchId: string, dto: CreateIngredientDto) {
    const dup = await this.prisma.ingredient.findFirst({
      where: { branchId, name: dto.name },
    });
    if (dup) throw new BadRequestException('Ingredient exists');

    // 👇 normalizamos y validamos
    const unit = normEnum<UnitType>(dto.unit);
    const kind = normEnum<IngredientKind>(dto.kind);

    if (!Object.values(UnitType).includes(unit)) {
      throw new BadRequestException('Invalid unit');
    }
    if (!Object.values(IngredientKind).includes(kind)) {
      throw new BadRequestException('Invalid kind (RAW | PREPARED)');
    }

    const waste = dto.wastePct ?? 0;

    const ing = await this.prisma.ingredient.create({
      data: {
        branchId,
        name: dto.name,
        unit,
        kind,
        wastePct: new Prisma.Decimal(waste),
      },
    });

    await this.prisma.inventoryItem.upsert({
      where: { branchId_ingredientId: { branchId, ingredientId: ing.id } },
      update: {},
      create: {
        branchId,
        ingredientId: ing.id,
        unit,
        qty: new Prisma.Decimal(0),
        minQty: new Prisma.Decimal(0),
      },
    });

    return ing;
  }

  async update(branchId: string, id: string, dto: UpdateIngredientDto) {
    const row = await this.prisma.ingredient.findFirst({
      where: { id, branchId },
    });
    if (!row) throw new NotFoundException('Ingredient not found');

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;

    if (dto.unit !== undefined) {
      const unit = normEnum<UnitType>(dto.unit);
      if (!Object.values(UnitType).includes(unit))
        throw new BadRequestException('Invalid unit');
      data.unit = unit;
    }

    if (dto.kind !== undefined) {
      const kind = normEnum<IngredientKind>(dto.kind);
      if (!Object.values(IngredientKind).includes(kind)) {
        throw new BadRequestException('Invalid kind (RAW | PREPARED)');
      }
      data.kind = kind;
    }

    if (dto.wastePct !== undefined)
      data.wastePct = new Prisma.Decimal(dto.wastePct);

    const updated = await this.prisma.ingredient.update({
      where: { id },
      data,
    });

    if (dto.unit !== undefined) {
      await this.prisma.inventoryItem.update({
        where: { branchId_ingredientId: { branchId, ingredientId: id } },
        data: { unit: data.unit },
      });
    }
    return updated;
  }

  list(branchId: string) {
    return this.prisma.ingredient.findMany({
      where: { branchId },
      orderBy: { name: 'asc' },
      include: { inventoryItem: true },
    });
  }

  async remove(branchId: string, id: string) {
    const row = await this.prisma.ingredient.findFirst({
      where: { id, branchId },
    });
    if (!row) throw new NotFoundException('Ingredient not found');

    try {
      await this.prisma.inventoryItem.deleteMany({
        where: { ingredientId: id },
      });
      return await this.prisma.ingredient.delete({ where: { id } });
    } catch (e: any) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new BadRequestException(
          'No se puede eliminar el ingrediente: tiene referencias (recetas, consumos, compras, etc.).',
        );
      }
      throw e;
    }
  }
}
