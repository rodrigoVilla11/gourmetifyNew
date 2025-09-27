// src/employee-pay/employee-pay.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { EmployeePayService } from './employee-pay.service';
import { AdvanceDto, BonusDto } from './dto/ab.dto';

@Controller('employee-pay')
export class EmployeePayController {
  constructor(private readonly svc: EmployeePayService) {}
  @Post('advance') addAdvance(@Body() d: AdvanceDto) { return this.svc.addAdvance(d); }
  @Post('bonus') addBonus(@Body() d: BonusDto) { return this.svc.addBonus(d); }
}
