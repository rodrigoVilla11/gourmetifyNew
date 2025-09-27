import { Module } from '@nestjs/common';
import { IngredientRecipesController } from './ingredient-recipes.controller';
import { IngredientRecipesService } from './ingredient-recipes.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [IngredientRecipesController],
  providers: [IngredientRecipesService, PrismaService],
  exports: [IngredientRecipesService],
})
export class IngredientRecipesModule {}
