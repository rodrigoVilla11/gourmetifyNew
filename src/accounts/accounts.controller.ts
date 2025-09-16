// src/accounts/accounts.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { BranchId } from '../common/tenant.decorators';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly service: AccountsService) {}

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateAccountDto) {
    if (!branchId) throw new Error('x-branch-id is required');
    return this.service.create(branchId, dto);
  }

  @Get()
  findAll(@BranchId() branchId: string) {
    return this.service.findAll(branchId);
  }

  @Get(':id')
  findOne(@BranchId() branchId: string, @Param('id') id: string) {
    return this.service.findOne(branchId, id);
  }

  @Patch(':id')
  update(@BranchId() branchId: string, @Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.service.update(branchId, id, dto);
  }

  @Delete(':id')
  remove(@BranchId() branchId: string, @Param('id') id: string) {
    return this.service.remove(branchId, id);
  }
}
