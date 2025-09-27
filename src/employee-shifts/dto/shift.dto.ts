// src/employee-shifts/dto/shift.dto.ts
import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class CheckInDto {
  @IsNotEmpty() employeeId: string;
  @IsNotEmpty() branchId: string;
  @IsDateString() checkIn: string; // ISO
}

export class CheckOutDto {
  @IsNotEmpty() shiftId: string;
  @IsDateString() checkOut: string; // ISO
}
