// src/customer-tag-links/customer-tag-links.controller.ts
import { Controller, Post, Delete, Body, Query } from '@nestjs/common';
import { CustomerTagLinksService } from './customer-tag-links.service';
import { LinkTagDto } from './dto/link.dto';
import { BranchId } from '../common/tenant.decorators';

@Controller('customer-tag-links')
export class CustomerTagLinksController {
  constructor(private readonly svc: CustomerTagLinksService) {}

  @Post()
  link(@BranchId() branchId: string, @Body() dto: LinkTagDto) {
    return this.svc.link(branchId, dto);
  }

  @Delete()
  unlink(@BranchId() branchId: string, @Query('customerId') customerId: string, @Query('tagId') tagId: string) {
    return this.svc.unlink(branchId, customerId, tagId);
  }
}
