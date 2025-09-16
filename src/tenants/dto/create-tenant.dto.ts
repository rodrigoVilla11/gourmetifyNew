import { IsEnum, IsNotEmpty } from 'class-validator';

export enum TenantStatus { ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE' }
export enum TenantPlan { FREE = 'FREE', PRO = 'PRO', ENTERPRISE = 'ENTERPRISE' }

export class CreateTenantDto {
  @IsNotEmpty() name: string;
  @IsEnum(TenantPlan) plan: TenantPlan = TenantPlan.FREE;
  @IsEnum(TenantStatus) status: TenantStatus = TenantStatus.ACTIVE;
}