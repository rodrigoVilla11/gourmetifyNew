// src/payslips/dto/payslip.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class GeneratePayslipDto {
  @IsNotEmpty() employeeId: string;
  @IsNumber() @Min(1) @Max(12) periodMonth: number; // 1-12
  @IsNumber() periodYear: number; // e.g., 2025
}
