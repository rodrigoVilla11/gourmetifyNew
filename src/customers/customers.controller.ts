// src/customers/customers.controller.ts
import { Controller, Post, Get, Param, Patch, Delete, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';
import { BranchId } from '../common/tenant.decorators';

@Controller('customers')
export class CustomersController {
  constructor(private readonly svc: CustomersService) {}

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateCustomerDto) {
    if (!branchId) throw new Error('x-branch-id is required');
    return this.svc.create(branchId, dto);
  }

  @Get()
  list(@BranchId() branchId: string) {
    return this.svc.list(branchId);
  }

  @Get(':id')
  detail(@BranchId() branchId: string, @Param('id') id: string) {
    return this.svc.detail(branchId, id);
  }

  @Patch(':id')
  update(@BranchId() branchId: string, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.svc.update(branchId, id, dto);
  }

  @Delete(':id')
  remove(@BranchId() branchId: string, @Param('id') id: string) {
    return this.svc.remove(branchId, id);
  }
}
