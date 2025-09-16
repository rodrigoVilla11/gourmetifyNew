// src/customer-tag-links/dto/link.dto.ts
import { IsNotEmpty } from 'class-validator';
export class LinkTagDto {
  @IsNotEmpty() customerId: string;
  @IsNotEmpty() tagId: string;
}
