// src/recipes/recipes.controller.ts
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { BranchId } from '../common/tenant.decorators';
import { UpsertRecipeDto } from './dto/create-recipe.dto';
@Controller('recipes')
export class RecipesController {
  constructor(private readonly svc: RecipesService) {}
  @Post('upsert') upsert(@BranchId() b: string, @Body() d: UpsertRecipeDto) {
    return this.svc.upsert(b, d);
  }
  @Get() getByProduct(@BranchId() b: string, @Query('productId') p: string) {
    return this.svc.getByProduct(b, p);
  }
}
