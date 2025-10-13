import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { TenantId } from '../common/tenant.decorators';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SuperAdminGuard } from 'src/auth/superadmin.guard';
// import { Roles } from '../auth/roles.decorator';
// import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
@UseGuards(AuthGuard('jwt')) // , RolesGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  // TENANT: crea dentro de su tenant (del JWT/header)
  // @Roles('ADMIN','MANAGER')
  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateUserDto) {
    if (!tenantId) throw new BadRequestException('Missing tenantId');
    return this.service.create(tenantId, dto);
  }

  // ADMIN: crea en cualquier tenant por query
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post('admin')
  createAdmin(@Query('tenantId') tenantId: string, @Body() dto: CreateUserDto) {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.service.create(tenantId, dto);
  }

  // TENANT: lista dentro de su tenant
  // @Roles('ADMIN','MANAGER','CASHIER','COOK')
  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Query('q') q?: string,
    @Query('branchId') branchIdRaw?: string, // "ALL" | "null" | uuid | undefined
    @Query('isActive') isActiveRaw?: string,
    @Query('skip') skipRaw?: string,
    @Query('take') takeRaw?: string,
  ) {
    if (!tenantId) throw new BadRequestException('Missing tenantId');

    const isActive =
      typeof isActiveRaw === 'string' ? isActiveRaw === 'true' : undefined;
    const skip = Number.isFinite(+skipRaw!) ? +skipRaw! : undefined;
    const take = Number.isFinite(+takeRaw!) ? +takeRaw! : undefined;

    // user desde JWT (o tu guard)
    const user = req.user as { role: string; branchId?: string | null };

    // Normalización de branchId
    // - "ALL"  => undefined (todas)
    // - "null" => null (sin sucursal)
    // - uuid   => uuid
    const normFromQuery =
      branchIdRaw === 'ALL'
        ? undefined
        : branchIdRaw === 'null'
          ? null
          : branchIdRaw || undefined;

    let effectiveBranchId: string | null | undefined = normFromQuery;

    const isAdminLike = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

    if (!isAdminLike) {
      // Para no-admins, forzar la sucursal efectiva (del JWT/header/ctx)
      const currentBranch =
        req.headers['x-branch-id'] ?? user?.branchId ?? null;

      if (!currentBranch) {
        // tu política: o 400 o 403 si requieren sucursal
        throw new ForbiddenException('Branch requerida para este rol');
      }

      // Ignoramos cualquier branchId de query
      effectiveBranchId = String(currentBranch);
    }

    return this.service.findAll(tenantId, {
      q,
      branchId: effectiveBranchId, // undefined=ALL, null=sin sucursal, uuid=filtrado
      isActive,
      skip,
      take,
    });
  }

  // ADMIN: lista por tenant vía query
  // @Roles('ADMIN')
  @Get('admin')
  findAllAdmin(@Query('tenantId') tenantId: string, @Query('q') q?: string) {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.service.findAll(tenantId, { q });
  }

  // @Roles('ADMIN','MANAGER')
  @Get(':id')
  findOne(
    @TenantId() tenantId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    if (!tenantId) throw new BadRequestException('Missing tenantId');
    return this.service.findOne(tenantId, id);
  }

  // @Roles('ADMIN','MANAGER')
  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    if (!tenantId) throw new BadRequestException('Missing tenantId');
    return this.service.update(tenantId, id, dto);
  }

  // @Roles('ADMIN','MANAGER')
  @Delete(':id')
  remove(
    @TenantId() tenantId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    if (!tenantId) throw new BadRequestException('Missing tenantId');
    return this.service.remove(tenantId, id);
  }
}
