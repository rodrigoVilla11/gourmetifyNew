import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class QueryDailyReportsDto {
  @IsOptional() @IsString()
  accountId?: string;

  @IsOptional() @IsString()
  categoryId?: string; // null en ingresos de ventas (cuando viene desde pagos)

  @IsOptional() @IsISO8601()
  from?: string; // "YYYY-MM-DD"

  @IsOptional() @IsISO8601()
  to?: string;   // "YYYY-MM-DD"
}
