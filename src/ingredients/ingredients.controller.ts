// src/ingredients/ingredients.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { BranchId } from '../common/tenant.decorators';
import { CreateIngredientDto, UpdateIngredientDto } from './dto/create-ingredient.dto';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly svc: IngredientsService) {}
  @Post() create(@BranchId() b: string, @Body() d: CreateIngredientDto) {
    return this.svc.create(b, d);
  }
  @Get() list(@BranchId() b: string) {
    return this.svc.list(b);
  }
  @Patch(':id') update(
    @BranchId() b: string,
    @Param('id') id: string,
    @Body() d: UpdateIngredientDto,
  ) {
    return this.svc.update(b, id, d);
  }
  @Delete(':id') remove(@BranchId() b: string, @Param('id') id: string) {
    return this.svc.remove(b, id);
  }
}
