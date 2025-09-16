// src/customer-notes/dto/create-note.dto.ts
import { IsNotEmpty } from 'class-validator';
export class CreateCustomerNoteDto {
  @IsNotEmpty() customerId: string;
  @IsNotEmpty() userId: string;
  @IsNotEmpty() note: string;
}
