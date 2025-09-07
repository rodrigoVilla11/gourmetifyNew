import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export type TenantScopedRequest = Request & { tenantId?: string; branchId?: string };

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: TenantScopedRequest, _res: Response, next: NextFunction) {
    // Para /tenants (crear/listar) no exigimos header
    if (req.path.startsWith('/tenants')) return next();

    const tenantId = req.header('x-tenant-id') || undefined;
    if (!tenantId) throw new BadRequestException('Missing x-tenant-id header');

    req.tenantId = tenantId;
    const branchId = req.header('x-branch-id') || undefined;
    if (branchId) req.branchId = branchId;
    next();
  }
}