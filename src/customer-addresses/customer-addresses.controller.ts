// src/customer-addresses/customer-addresses.controller.ts
import { Controller, Post, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { CustomerAddressesService } from './customer-addresses.service';
import { CreateCustomerAddressDto, UpdateCustomerAddressDto } from './dto/create-customer-address.dto';
import { BranchId } from '../common/tenant.decorators';

@Controller('customer-addresses')
export class CustomerAddressesController {
  constructor(private readonly svc: CustomerAddressesService) {}

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateCustomerAddressDto) {
    if (!branchId) throw new Error('x-branch-id is required');
    return this.svc.create(branchId, dto);
  }

  @Get()
  list(@BranchId() _branchId: string, @Query('customerId') customerId: string) {
    return this.svc.list(_branchId, customerId);
  }

  @Patch(':id')
  update(@BranchId() branchId: string, @Param('id') id: string, @Body() dto: UpdateCustomerAddressDto) {
    return this.svc.update(branchId, id, dto);
  }

  @Delete(':id')
  remove(@BranchId() branchId: string, @Param('id') id: string) {
    return this.svc.remove(branchId, id);
  }
}
