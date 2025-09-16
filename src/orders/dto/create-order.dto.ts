// src/orders/dto/order.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export enum OrderStatus {
  OPEN = 'OPEN',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
}

export enum OrderChannel {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY',
}

export class CreateOrderDto {
  @IsNotEmpty() cashierId: string;
  @IsEnum(OrderChannel) channel: OrderChannel;
  @IsOptional() customerId?: string;
  @IsOptional() addressId?: string;
  @IsOptional() @IsString() customerName?: string;
  @IsOptional() @IsString() deliveryNotes?: string;
  @IsOptional() @IsNumber() subtotal?: number = 0;
  @IsOptional() @IsNumber() discountTotal?: number = 0;
  @IsOptional() @IsNumber() total?: number = 0;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus) status: OrderStatus;
}
