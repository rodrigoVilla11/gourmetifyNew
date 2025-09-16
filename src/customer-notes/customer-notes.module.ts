import { Module } from '@nestjs/common';
import { CustomerNotesService } from './customer-notes.service';
import { CustomerNotesController } from './customer-notes.controller';

@Module({
  controllers: [CustomerNotesController],
  providers: [CustomerNotesService],
})
export class CustomerNotesModule {}
