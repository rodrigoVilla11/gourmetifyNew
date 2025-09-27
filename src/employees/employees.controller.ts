// src/employees/employees.controller.ts
import { Controller, Post, Get, Body } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { TenantId } from '../common/tenant.decorators';
import { CreateEmployeeDto, AddRateDto } from './dto/employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly svc: EmployeesService) {}

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateEmployeeDto) {
    return this.svc.create(tenantId, dto);
  }

  @Post('rates')
  addRate(@TenantId() tenantId: string, @Body() dto: AddRateDto) {
    return this.svc.addRate(tenantId, dto);
  }

  @Get()
  list(@TenantId() tenantId: string) {
    return this.svc.list(tenantId);
  }
}
