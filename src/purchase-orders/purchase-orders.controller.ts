// src/purchase-orders/purchase-orders.controller.ts
import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { BranchId } from '../common/tenant.decorators';
import {
  AddPOItemDto,
  CreatePurchaseOrderDto,
  SetPOStatusDto,
} from './dto/po.dto';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly svc: PurchaseOrdersService) {}
  @Post() create(@BranchId() b: string, @Body() d: CreatePurchaseOrderDto) {
    return this.svc.create(b, d);
  }
  @Get() list(@BranchId() b: string) {
    return this.svc.list(b);
  }
  @Post('add-item') addItem(@BranchId() b: string, @Body() d: AddPOItemDto) {
    return this.svc.addItem(b, d);
  }
  @Patch(':id/status') setStatus(
    @BranchId() b: string,
    @Param('id') id: string,
    @Body() d: SetPOStatusDto,
  ) {
    return this.svc.setStatus(b, id, d);
  }
}
