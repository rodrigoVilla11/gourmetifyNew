import { Module } from '@nestjs/common';
import { CustomerTagLinksService } from './customer-tag-links.service';
import { CustomerTagLinksController } from './customer-tag-links.controller';

@Module({
  controllers: [CustomerTagLinksController],
  providers: [CustomerTagLinksService],
})
export class CustomerTagLinksModule {}
