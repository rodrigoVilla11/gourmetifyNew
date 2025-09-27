import { Controller, Get, Query } from '@nestjs/common';
import { DailyReportsService } from './daily-reports.service';
import { BranchId } from '../common/tenant.decorators';
import { QueryDailyReportsDto } from './dto/query-daily-reports.dto';

@Controller('daily-reports')
export class DailyReportsController {
  constructor(private readonly svc: DailyReportsService) {}

  @Get()
  list(@BranchId() branchId: string, @Query() q: QueryDailyReportsDto) {
    return this.svc.list(branchId, q);
  }

  @Get('summary')
  summary(@BranchId() branchId: string, @Query() q: QueryDailyReportsDto) {
    return this.svc.summary(branchId, q);
  }
}
