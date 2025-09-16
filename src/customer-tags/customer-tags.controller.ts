// src/customer-tags/customer-tags.controller.ts
import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { CustomerTagsService } from './customer-tags.service';
import { CreateCustomerTagDto, UpdateCustomerTagDto } from './dto/create-customer-tag.dto';
import { BranchId } from '../common/tenant.decorators';

@Controller('customer-tags')
export class CustomerTagsController {
  constructor(private readonly svc: CustomerTagsService) {}

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateCustomerTagDto) {
    if (!branchId) throw new Error('x-branch-id is required');
    return this.svc.create(branchId, dto);
  }

  @Get()
  list(@BranchId() branchId: string) {
    return this.svc.list(branchId);
  }

  @Patch(':id')
  update(@BranchId() branchId: string, @Param('id') id: string, @Body() dto: UpdateCustomerTagDto) {
    return this.svc.update(branchId, id, dto);
  }

  @Delete(':id')
  remove(@BranchId() branchId: string, @Param('id') id: string) {
    return this.svc.remove(branchId, id);
  }
}
