// src/transfers/transfers.controller.ts
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { BranchId } from '../common/tenant.decorators';

@Controller('transfers')
export class TransfersController {
  constructor(private readonly svc: TransfersService) {}

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateTransferDto) {
    if (!branchId) throw new Error('x-branch-id is required');
    return this.svc.create(branchId, dto);
  }

  @Get()
  list(@BranchId() branchId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.svc.list(branchId, from, to);
  }
}
