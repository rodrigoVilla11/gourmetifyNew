// src/cash-closures/cash-closures.controller.ts
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { CashClosuresService } from './cash-closures.service';
import { CreateCashClosureDto } from './dto/create-cash-closure.dto';
import { BranchId } from '../common/tenant.decorators';

@Controller('cash-closures')
export class CashClosuresController {
  constructor(private readonly svc: CashClosuresService) {}

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateCashClosureDto) {
    if (!branchId) throw new Error('x-branch-id is required');
    return this.svc.create(branchId, dto);
  }

  @Get()
  list(@BranchId() branchId: string, @Query('accountId') accountId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.svc.list(branchId, accountId, from, to);
  }
}
