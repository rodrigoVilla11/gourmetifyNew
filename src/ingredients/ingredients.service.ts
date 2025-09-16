import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UnitType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
} from './dto/create-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  async create(branchId: string, dto: CreateIngredientDto) {
    const dup = await this.prisma.ingredient.findFirst({
      where: { branchId, name: dto.name },
    });
    if (dup) throw new BadRequestException('Ingredient exists');

    const ing = await this.prisma.ingredient.create({
      data: {
        branchId, // ← crudo
        name: dto.name,
        unit: dto.unit as UnitType,
        wastePct: new Prisma.Decimal(dto.wastePct ?? 0),
      } as Prisma.IngredientUncheckedCreateInput,
    });

    // InventoryItem: usá relaciones también
    await this.prisma.inventoryItem.upsert({
      where: { branchId_ingredientId: { branchId, ingredientId: ing.id } },
      update: {},
      create: {
        branchId, // ← crudo
        ingredientId: ing.id, // ← crudo
        unit: dto.unit as UnitType,
        qty: new Prisma.Decimal(0),
        minQty: new Prisma.Decimal(0),
      } as Prisma.InventoryItemUncheckedCreateInput,
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
    if (dto.unit !== undefined) data.unit = dto.unit as UnitType;
    if (dto.wastePct !== undefined)
      data.wastePct = new Prisma.Decimal(dto.wastePct);

    const updated = await this.prisma.ingredient.update({
      where: { id },
      data,
    });

    if (dto.unit !== undefined) {
      await this.prisma.inventoryItem.update({
        where: { branchId_ingredientId: { branchId, ingredientId: id } },
        data: { unit: dto.unit as UnitType },
      });
    }
    return updated;
  }

  list(branchId: string) {
    return this.prisma.ingredient.findMany({
      where: { branchId },
      orderBy: { name: 'asc' },
      include: { inventoryItem: true }, // o { inventory: true } según tu alias
    });
  }

  // REMOVE: con manejo de FK (recetas/consumos/PO items, etc.)
  async remove(branchId: string, id: string) {
    const row = await this.prisma.ingredient.findFirst({
      where: { id, branchId },
    });
    if (!row) throw new NotFoundException('Ingredient not found');

    try {
      // si querés limpiar inventory antes (opcional):
      await this.prisma.inventoryItem.deleteMany({
        where: { ingredientId: id },
      });

      return await this.prisma.ingredient.delete({ where: { id } });
    } catch (e: any) {
      // Prisma FK violation
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
