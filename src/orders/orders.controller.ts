// src/orders/orders.controller.ts
import { Controller, Post, Get, Param, Patch, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { BranchId } from '../common/tenant.decorators';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly svc: OrdersService) {}

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateOrderDto) {
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

  @Patch(':id/status')
  setStatus(@BranchId() branchId: string, @Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.svc.setStatus(branchId, id, dto);
  }
}
