import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { TenantId } from '../common/tenant.decorators';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SuperAdminGuard } from 'src/auth/superadmin.guard';

@Controller('branches')
export class BranchesController {
  constructor(private readonly service: BranchesService) {}

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateBranchDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post('admin')
  createAdmin(@Query('tenantId') tenantId: string, @Body() dto: CreateBranchDto) {
    return this.service.create(tenantId, dto);
  }

  @Get('admin')
  findAllAdmin(@Query('tenantId') tenantId?: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}
