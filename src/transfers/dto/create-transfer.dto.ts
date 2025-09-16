// src/transfers/dto/create-transfer.dto.ts
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransferDto {
  @IsNotEmpty() fromAccountId: string;
  @IsNotEmpty() toAccountId: string;
  @IsNumber() amount: number;        // positivo
  @IsDateString() date: string;
  @IsOptional() @IsString() description?: string;
  @IsNotEmpty() userId: string;
}
