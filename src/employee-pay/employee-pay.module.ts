import { Module } from '@nestjs/common';
import { EmployeePayService } from './employee-pay.service';
import { EmployeePayController } from './employee-pay.controller';

@Module({
  controllers: [EmployeePayController],
  providers: [EmployeePayService],
})
export class EmployeePayModule {}
