import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { IngredientRecipesService } from './ingredient-recipes.service';
import { BranchId } from '../common/tenant.decorators';
import { UpsertIngredientRecipeDto } from './dto/ingredient-recipe.dto';

@Controller('ingredient-recipes')
export class IngredientRecipesController {
  constructor(private readonly svc: IngredientRecipesService) {}

  @Post('upsert')
  upsert(@BranchId() branchId: string, @Body() dto: UpsertIngredientRecipeDto) {
    return this.svc.upsert(branchId, dto);
  }

  @Get()
  getByPreparedIngredient(@BranchId() branchId: string, @Query('preparedIngredientId') preparedIngredientId: string) {
    return this.svc.getByPreparedIngredient(branchId, preparedIngredientId);
  }

  @Get('by-branch')
  listByBranch(@BranchId() branchId: string) {
    return this.svc.listByBranch(branchId);
  }
}
