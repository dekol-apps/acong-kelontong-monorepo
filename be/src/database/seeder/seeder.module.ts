import { Module } from '@nestjs/common';
import { UserSeederService } from './user-seeder/user-seeder.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/user/user.schema';
import { ProductSeederService } from './product-seeder/product-seeder.service';
import { SeederService } from './seeder.service';
import { Product, ProductSchema } from 'src/modules/product/product.schema';
import { Role, RoleSchema } from 'src/modules/role/role.schema';
import { SupplierSeederService } from './supplier-seeder/supplier-seeder.service';
import { Supplier, SupplierSchema } from 'src/modules/supplier/supplier.schema';
import { Brand, BrandSchema } from 'src/modules/brand/brand.schema';
import { BalanceSeederService } from './balance-seeder/balance-seeder.service';
import { AccountingBalance, AccountingBalanceSchema } from 'src/modules/accounting/accounting-balance.schema';

import { InventoryItem, InventoryItemSchema } from 'src/modules/inventory-item/inventory-item.schema';
import { InventoryMovement, InventoryMovementSchema } from 'src/modules/inventory-movement/inventory-movement.schema';
import { Investment, InvestmentSchema } from 'src/modules/investment/investment.schema';
import { Expense, ExpenseSchema } from 'src/modules/expense/expense.schema';
import { Purchasing, PurchasingSchema } from 'src/modules/purchasing/purchasing.schema';
import { PurchasingItem, PurchasingItemSchema } from 'src/modules/purchasing-item/purchasing-item.schema';
import { Sale, SaleSchema } from 'src/modules/sale/sale.schema';
import { Production, ProductionSchema } from 'src/modules/production/production.schema';
import { Accounting, AccountingSchema } from 'src/modules/accounting/accounting.schema';
import { AccountingSnapshot, AccountingSnapshotSchema } from 'src/modules/accounting/accounting-snapshot.schema';
import { Auth, AuthSchema } from 'src/modules/auth/auth.schema';
import { InventoryReconcile, InventoryReconcileSchema } from 'src/modules/inventory-item/inventory-reconcile.schema';
import { Trash, TrashSchema } from 'src/global/global.schema';
import { GlobalService } from 'src/global/global.service';
import { AccountingService } from 'src/modules/accounting/accounting.service';
import { InvestmentService } from 'src/modules/investment/investment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Brand.name, schema: BrandSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: AccountingBalance.name, schema: AccountingBalanceSchema },
      { name: InventoryItem.name, schema: InventoryItemSchema },
      { name: InventoryMovement.name, schema: InventoryMovementSchema },
      { name: Investment.name, schema: InvestmentSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Purchasing.name, schema: PurchasingSchema },
      { name: PurchasingItem.name, schema: PurchasingItemSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Production.name, schema: ProductionSchema },
      { name: Accounting.name, schema: AccountingSchema },
      { name: AccountingSnapshot.name, schema: AccountingSnapshotSchema },
      { name: Auth.name, schema: AuthSchema },
      { name: InventoryReconcile.name, schema: InventoryReconcileSchema },
      { name: Trash.name, schema: TrashSchema },
    ]),
  ],
  providers: [
    SeederService,
    UserSeederService,
    ProductSeederService,
    SupplierSeederService,
    BalanceSeederService,
    GlobalService,
    AccountingService,
    InvestmentService,
  ],
  exports: [
    MongooseModule,
    SeederService,
    UserSeederService,
    ProductSeederService,
    SupplierSeederService,
    BalanceSeederService,
    GlobalService,
    AccountingService,
    InvestmentService,
  ],
})
export class SeederModule { }
