// src/employee-shifts/employee-shifts.controller.ts
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { EmployeeShiftsService } from './employee-shifts.service';
import { CheckInDto, CheckOutDto } from './dto/shift.dto';

@Controller('employee-shifts')
export class EmployeeShiftsController {
  constructor(private readonly svc: EmployeeShiftsService) {}

  @Post('check-in') checkIn(@Body() dto: CheckInDto) { return this.svc.checkIn(dto); }
  @Post('check-out') checkOut(@Body() dto: CheckOutDto) { return this.svc.checkOut(dto); }
  @Get() list(@Query('employeeId') employeeId: string) { return this.svc.listByEmployee(employeeId); }
}
