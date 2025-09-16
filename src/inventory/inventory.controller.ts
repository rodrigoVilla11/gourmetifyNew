// src/inventory/inventory.controller.ts
import { Controller, Get, Patch, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { BranchId } from '../common/tenant.decorators';
import { AdjustInventoryDto } from './dto/create-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}
  @Get() list(@BranchId() b: string) {
    return this.svc.list(b);
  }
  @Patch('adjust') adjust(
    @BranchId() b: string,
    @Body() d: AdjustInventoryDto,
  ) {
    return this.svc.adjust(b, d);
  }
}
