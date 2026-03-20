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

import { InventorySeederService } from './inventory-seeder/inventory-seeder.service';
import { InvestmentSeederService } from './investment-seeder/investment-seeder.service';
import { ExpenseSeederService } from './expense-seeder/expense-seeder.service';
import { PurchasingSeederService } from './purchasing-seeder/purchasing-seeder.service';
import { SaleSeederService } from './sale-seeder/sale-seeder.service';
import { ProductionSeederService } from './production-seeder/production-seeder.service';
import { InventoryItem, InventoryItemSchema } from 'src/modules/inventory-item/inventory-item.schema';
import { InventoryMovement, InventoryMovementSchema } from 'src/modules/inventory-movement/inventory-movement.schema';
import { Investment, InvestmentSchema } from 'src/modules/investment/investment.schema';
import { Expense, ExpenseSchema } from 'src/modules/expense/expense.schema';
import { Purchasing, PurchasingSchema } from 'src/modules/purchasing/purchasing.schema';
import { PurchasingItem, PurchasingItemSchema } from 'src/modules/purchasing-item/purchasing-item.schema';
import { Sale, SaleSchema } from 'src/modules/sale/sale.schema';
import { Production, ProductionSchema } from 'src/modules/production/production.schema';

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
    ]),
  ],
  providers: [
    SeederService,
    UserSeederService,
    ProductSeederService,
    SupplierSeederService,
    BalanceSeederService,
    InventorySeederService,
    InvestmentSeederService,
    ExpenseSeederService,
    PurchasingSeederService,
    SaleSeederService,
    ProductionSeederService,
  ],
  exports: [
    MongooseModule,
    SeederService,
    UserSeederService,
    ProductSeederService,
    SupplierSeederService,
    BalanceSeederService,
    InventorySeederService,
    InvestmentSeederService,
    ExpenseSeederService,
    PurchasingSeederService,
    SaleSeederService,
    ProductionSeederService,
  ],
})
export class SeederModule { }
