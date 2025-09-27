import { Module } from '@nestjs/common';
import { ProductionBatchesService } from './production-batches.service';
import { ProductionBatchesController } from './production-batches.controller';

@Module({
  controllers: [ProductionBatchesController],
  providers: [ProductionBatchesService],
})
export class ProductionBatchesModule {}
