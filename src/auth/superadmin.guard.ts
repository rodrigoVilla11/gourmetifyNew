// auth/superadmin.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const role = req.user?.role;
    if (role !== 'SUPER_ADMIN') throw new ForbiddenException();
    return true;
  }
}
