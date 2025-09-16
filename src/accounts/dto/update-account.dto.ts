import { AccountType } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";

export class UpdateAccountDto {
  @IsOptional() name?: string;
  @IsOptional() @IsEnum(AccountType) type?: AccountType;
  @IsOptional() isActive?: boolean;
}
