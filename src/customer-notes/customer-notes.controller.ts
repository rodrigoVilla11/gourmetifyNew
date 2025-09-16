// src/customer-notes/customer-notes.controller.ts
import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { CustomerNotesService } from './customer-notes.service';
import { BranchId } from '../common/tenant.decorators';
import { CreateCustomerNoteDto } from './dto/create-customer-note.dto';

@Controller('customer-notes')
export class CustomerNotesController {
  constructor(private readonly svc: CustomerNotesService) {}

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateCustomerNoteDto) {
    return this.svc.create(branchId, dto);
  }

  @Get()
  list(@BranchId() branchId: string, @Query('customerId') customerId: string) {
    return this.svc.list(branchId, customerId);
  }

  @Delete(':id')
  remove(@BranchId() branchId: string, @Param('id') id: string) {
    return this.svc.remove(branchId, id);
  }
}
