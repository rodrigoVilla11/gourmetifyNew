import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TenantContextMiddleware } from './common/tenant-context.middleware';
import { TenantsModule } from './tenants/tenants.module';
import { BranchesModule } from './branches/branches.module';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { FinanceModule } from './finance/finance.module';
import { CategoriesModule } from './categories/categories.module';
import { MovementsModule } from './movements/movements.module';
import { TransfersModule } from './transfers/transfers.module';
import { CashClosuresModule } from './cash-closures/cash-closures.module';
import { CustomersModule } from './customers/customers.module';
import { CustomerAddressesModule } from './customer-addresses/customer-addresses.module';
import { CustomerTagsModule } from './customer-tags/customer-tags.module';
import { CustomerTagLinksModule } from './customer-tag-links/customer-tag-links.module';
import { CustomerNotesModule } from './customer-notes/customer-notes.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { OrderPaymentsModule } from './order-payments/order-payments.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { ProductsModule } from './products/products.module';
import { RecipesModule } from './recipes/recipes.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { InventoryModule } from './inventory/inventory.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { ProductionBatchesModule } from './production-batches/production-batches.module';
import { DailyReportsModule } from './daily-reports/daily-reports.module';
import { IngredientRecipesModule } from './ingredient-recipes/ingredient-recipes.module';
import { EmployeesModule } from './employees/employees.module';
import { EmployeeShiftsModule } from './employee-shifts/employee-shifts.module';
import { EmployeePayModule } from './employee-pay/employee-pay.module';
import { PayslipsModule } from './payslips/payslips.module';

@Module({
  imports: [PrismaModule, TenantsModule, BranchesModule, UsersModule, AccountsModule, FinanceModule, CategoriesModule, MovementsModule, TransfersModule, CashClosuresModule, CustomersModule, CustomerAddressesModule, CustomerTagsModule, CustomerTagLinksModule, CustomerNotesModule, OrdersModule, OrderItemsModule, OrderPaymentsModule, ProductCategoriesModule, ProductsModule, RecipesModule, IngredientsModule, InventoryModule, SuppliersModule, PurchaseOrdersModule, ProductionBatchesModule, DailyReportsModule, IngredientRecipesModule, EmployeesModule, EmployeeShiftsModule, EmployeePayModule, PayslipsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .exclude('tenants', 'tenants/(.*)') // <- excluye /tenants
      .forRoutes('*');
  }
}
