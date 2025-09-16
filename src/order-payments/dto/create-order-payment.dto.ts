// src/order-payments/dto/order-payment.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderPaymentDto {
  @IsNotEmpty() orderId: string;
  @IsNotEmpty() accountId: string;
  @IsNumber() amount: number;
  @IsOptional() @IsString() note?: string;
}
