// src/suppliers/suppliers.controller.ts
import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { BranchId } from '../common/tenant.decorators';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  UpsertSupplierPriceDto,
} from './dto/supplier.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly svc: SuppliersService) {}
  @Post() create(@BranchId() b: string, @Body() d: CreateSupplierDto) {
    return this.svc.create(b, d);
  }
  @Get() list(@BranchId() b: string) {
    return this.svc.list(b);
  }
  @Patch(':id') update(
    @BranchId() b: string,
    @Param('id') id: string,
    @Body() d: UpdateSupplierDto,
  ) {
    return this.svc.update(b, id, d);
  }
  @Post('upsert-price') upsertPrice(
    @BranchId() b: string,
    @Body() d: UpsertSupplierPriceDto,
  ) {
    return this.svc.upsertPrice(b, d);
  }
}
