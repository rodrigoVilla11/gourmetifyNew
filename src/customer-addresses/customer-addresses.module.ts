import { Module } from '@nestjs/common';
import { CustomerAddressesService } from './customer-addresses.service';
import { CustomerAddressesController } from './customer-addresses.controller';

@Module({
  controllers: [CustomerAddressesController],
  providers: [CustomerAddressesService],
})
export class CustomerAddressesModule {}
