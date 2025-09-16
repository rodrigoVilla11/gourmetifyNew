// src/products/products.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { BranchId } from '../common/tenant.decorators';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly svc: ProductsService) {}
  @Post() create(@BranchId() b: string, @Body() d: CreateProductDto) {
    return this.svc.create(b, d);
  }
  @Get() list(@BranchId() b: string) {
    return this.svc.list(b);
  }
  @Patch(':id') update(
    @BranchId() b: string,
    @Param('id') id: string,
    @Body() d: UpdateProductDto,
  ) {
    return this.svc.update(b, id, d);
  }
  @Delete(':id') remove(@BranchId() b: string, @Param('id') id: string) {
    return this.svc.remove(b, id);
  }
}
