import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty() name: string;
  @IsOptional() address?: string;
  @IsOptional() phone?: string;
}

