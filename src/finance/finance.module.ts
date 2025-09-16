import { Global, Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}