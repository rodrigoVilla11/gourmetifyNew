// src/payslips/payslips.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { PayslipsService } from './payslips.service';
import { GeneratePayslipDto } from './dto/payslip.dto';

@Controller('payslips')
export class PayslipsController {
  constructor(private readonly svc: PayslipsService) {}
  @Post('generate') generate(@Body() d: GeneratePayslipDto) { return this.svc.generate(d); }
}
