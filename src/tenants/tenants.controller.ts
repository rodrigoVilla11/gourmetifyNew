import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SuperAdminGuard } from 'src/auth/superadmin.guard';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post() create(@Body() dto: CreateTenantDto) {
    return this.service.create(dto);
  }
  @Get() findAll() {
    return this.service.findAll();
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
