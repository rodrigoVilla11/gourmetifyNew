import { Module } from '@nestjs/common';
import { EmployeeShiftsService } from './employee-shifts.service';
import { EmployeeShiftsController } from './employee-shifts.controller';

@Module({
  controllers: [EmployeeShiftsController],
  providers: [EmployeeShiftsService],
})
export class EmployeeShiftsModule {}
