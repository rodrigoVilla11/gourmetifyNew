// src/employee-pay/dto/ab.dto.ts
import { IsDateString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class AdvanceDto {
  @IsNotEmpty() employeeId: string;
  @IsNotEmpty() branchId: string;
  @IsDateString() date: string;
  @IsNumber() @Min(0.01) amount: number;
  @IsOptional() description?: string;
}

export class BonusDto {
  @IsNotEmpty() employeeId: string;
  @IsNotEmpty() branchId: string;
  @IsDateString() date: string;
  @IsNotEmpty() type: 'BONUS' | 'TIP' | 'OTHER';
  @IsNumber() @Min(0.01) amount: number;
  @IsOptional() description?: string;
}
