// src/customer-notes/customer-notes.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerNoteDto } from './dto/create-customer-note.dto';

@Injectable()
export class CustomerNotesService {
  constructor(private prisma: PrismaService) {}

  async create(branchId: string, dto: CreateCustomerNoteDto) {
    const customer = await this.prisma.customer.findFirst({ where: { id: dto.customerId, branchId } });
    if (!customer) throw new BadRequestException('customerId does not belong to branch');

    return this.prisma.customerNote.create({
      data: { customerId: dto.customerId, userId: dto.userId, note: dto.note, createdAt: new Date() },
    });
  }

  list(branchId: string, customerId: string) {
    return this.prisma.customerNote.findMany({
      where: { customerId, customer: { branchId } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(branchId: string, id: string) {
    const row = await this.prisma.customerNote.findFirst({ where: { id, customer: { branchId } } });
    if (!row) throw new NotFoundException('Note not found');
    return this.prisma.customerNote.delete({ where: { id } });
  }
}
