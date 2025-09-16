// src/movements/movements.controller.ts
import { Controller, Post, Get, Param, Patch, Delete, Body, Query } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { CreateMovementDto, UpdateMovementDto } from './dto/create-movement.dto';
import { BranchId } from '../common/tenant.decorators';

@Controller('movements')
export class MovementsController {
  constructor(private readonly svc: MovementsService) {}

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateMovementDto) {
    if (!branchId) throw new Error('x-branch-id is required');
    return this.svc.create(branchId, dto);
  }

  @Get()
  listByDate(@BranchId() branchId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.svc.listByDate(branchId, from, to);
  }

  @Get(':id')
  detail(@BranchId() branchId: string, @Param('id') id: string) {
    return this.svc.detail(branchId, id);
  }

  @Patch(':id')
  update(@BranchId() branchId: string, @Param('id') id: string, @Body() dto: UpdateMovementDto) {
    return this.svc.update(branchId, id, dto);
  }

  @Delete(':id')
  remove(@BranchId() branchId: string, @Param('id') id: string) {
    return this.svc.remove(branchId, id);
  }
}
