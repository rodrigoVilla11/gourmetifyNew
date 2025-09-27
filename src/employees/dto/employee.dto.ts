// src/employees/dto/employee.dto.ts
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateEmployeeDto {
  @IsNotEmpty() userId: string; // debe existir y pertenecer al tenant
  @IsDateString() startDate: string;
  @IsOptional() @IsDateString() endDate?: string;
}

export class AddRateDto {
  @IsNotEmpty() employeeId: string;
  @IsNumber() @Min(0) hourlyRate: number;
  @IsDateString() validFrom: string;
  @IsOptional() @IsDateString() validTo?: string;
}
