import { Module } from '@nestjs/common';
import { DailyReportsController } from './daily-reports.controller';
import { DailyReportsService } from './daily-reports.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DailyReportsController],
  providers: [DailyReportsService, PrismaService],
  exports: [DailyReportsService],
})
export class DailyReportsModule {}
