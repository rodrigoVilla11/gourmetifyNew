// src/customer-tag-links/customer-tag-links.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LinkTagDto } from './dto/link.dto';

@Injectable()
export class CustomerTagLinksService {
  constructor(private prisma: PrismaService) {}

  async link(branchId: string, dto: LinkTagDto) {
    const [cust, tag] = await Promise.all([
      this.prisma.customer.findFirst({ where: { id: dto.customerId, branchId } }),
      this.prisma.customerTag.findFirst({ where: { id: dto.tagId, branchId } }),
    ]);
    if (!cust || !tag) throw new BadRequestException('Customer/Tag must belong to the same branch');

    return this.prisma.customerTagLink.create({
      data: { customerId: dto.customerId, tagId: dto.tagId, createdAt: new Date() },
    });
  }

  async unlink(_branchId: string, customerId: string, tagId: string) {
    const link = await this.prisma.customerTagLink.findFirst({ where: { customerId, tagId } });
    if (!link) return { ok: true };
    await this.prisma.customerTagLink.delete({ where: { id: link.id } });
    return { ok: true };
  }
}
