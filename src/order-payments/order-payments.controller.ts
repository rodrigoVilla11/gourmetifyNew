// src/order-payments/order-payments.controller.ts
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { OrderPaymentsService } from './order-payments.service';
import { BranchId } from '../common/tenant.decorators';
import { CreateOrderPaymentDto } from './dto/create-order-payment.dto';

@Controller('order-payments')
export class OrderPaymentsController {
  constructor(private readonly svc: OrderPaymentsService) {}

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateOrderPaymentDto) {
    return this.svc.create(branchId, dto);
  }

  @Get()
  list(@BranchId() branchId: string, @Query('orderId') orderId: string) {
    return this.svc.list(branchId, orderId);
  }
}
