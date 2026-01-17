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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Brand.name, schema: BrandSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: AccountingBalance.name, schema: AccountingBalanceSchema },
    ]),
  ],
  providers: [SeederService, UserSeederService, ProductSeederService, SupplierSeederService, ProductSeederService, BalanceSeederService],
  exports: [MongooseModule, SeederService, UserSeederService, ProductSeederService], // export so AppModule can trigger it
})
export class SeederModule { }
