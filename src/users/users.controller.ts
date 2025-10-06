import {
  Controller, Get, Post, Body, Param, Patch, Delete, Query,
  BadRequestException, UseGuards, ParseUUIDPipe,
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
    @Query('q') q?: string,
    @Query('branchId') branchId?: string,
    @Query('isActive') isActiveRaw?: string,
    @Query('skip') skipRaw?: string,
    @Query('take') takeRaw?: string,
  ) {
    if (!tenantId) throw new BadRequestException('Missing tenantId');
    const isActive = typeof isActiveRaw === 'string' ? isActiveRaw === 'true' : undefined;
    const skip = Number.isFinite(+skipRaw!) ? +skipRaw! : undefined;
    const take = Number.isFinite(+takeRaw!) ? +takeRaw! : undefined;

    // permitir branchId=null por query: ?branchId=null
    const branch = branchId === 'null' ? null : branchId;

    return this.service.findAll(tenantId, { q, branchId: branch, isActive, skip, take });
  }

  // ADMIN: lista por tenant vía query
  // @Roles('ADMIN')
  @Get('admin')
  findAllAdmin(
    @Query('tenantId') tenantId: string,
    @Query('q') q?: string,
  ) {
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
