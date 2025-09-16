// src/order-items/dto/order-item.dto.ts
import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsNotEmpty() orderId: string;
  @IsNotEmpty() productId: string;
  @IsInt() @Min(1) qty: number;
}
