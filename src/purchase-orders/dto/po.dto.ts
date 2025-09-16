// src/purchase-orders/dto/
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
export enum PurchaseOrderStatus { DRAFT='DRAFT', ORDERED='ORDERED', RECEIVED='RECEIVED', CANCELLED='CANCELLED' }

export class CreatePurchaseOrderDto {
  @IsNotEmpty() supplierId: string;
  @IsDateString() date: string;
  @IsOptional() paymentTerm?: string; // texto libre, podés usar enum si querés
}
export class AddPOItemDto {
  @IsNotEmpty() purchaseOrderId: string;
  @IsNotEmpty() ingredientId: string;
  @IsNumber() qty: number;
  @IsNumber() unitPrice: number;
}
export class SetPOStatusDto {
  @IsEnum(PurchaseOrderStatus) status: PurchaseOrderStatus;
}
