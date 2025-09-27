// src/production-batches/production-batches.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ProductionBatchesService } from './production-batches.service';
import { BranchId } from '../common/tenant.decorators';
import { CreateProductionBatchDto } from './dto/production-batch.dto';

@Controller('production-batches')
export class ProductionBatchesController {
  constructor(private readonly svc: ProductionBatchesService) {}

  @Post()
  createCompleted(
    @BranchId() branchId: string,
    @Body() dto: CreateProductionBatchDto,
  ) {
    return this.svc.createCompleted(branchId, dto);
  }
}
