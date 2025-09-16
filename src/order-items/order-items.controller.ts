// src/order-items/order-items.controller.ts
import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { BranchId } from '../common/tenant.decorators';
import { CreateOrderItemDto } from './dto/create-order-item.dto';

@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly svc: OrderItemsService) {}

  @Post()
  add(@BranchId() branchId: string, @Body() dto: CreateOrderItemDto) {
    return this.svc.add(branchId, dto);
  }

  @Delete(':id')
  remove(@BranchId() branchId: string, @Param('id') id: string) {
    return this.svc.remove(branchId, id);
  }
}
