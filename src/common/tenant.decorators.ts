import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { TenantScopedRequest } from './tenant-context.middleware';

export const TenantId = createParamDecorator((_d: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<TenantScopedRequest>();
  if (!req.tenantId) throw new BadRequestException('x-tenant-id required');
  return req.tenantId;
});

export const BranchId = createParamDecorator((_d: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<TenantScopedRequest>();
  return req.branchId; // opcional
});