// src/accounts/dto/create-account.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export enum AccountType {
  CASH = 'CASH',
  MP = 'MP',
  BANK = 'BANK',
  OTHER = 'OTHER'
}

export class CreateAccountDto {
  @IsNotEmpty() name: string;
  @IsEnum(AccountType) type: AccountType;
  @IsBoolean() isActive: boolean = true;
}

