import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeederModule } from './database/seeder/seeder.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { toNumber } from './utils/helper';
import { Auth, AuthSchema } from './modules/auth/auth.schema';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { UAuthGuard } from './modules/auth/auth.guard';
import { UserController } from './modules/user/user.controller';
import { UserService } from './modules/user/user.service';
import { User, UserSchema } from './modules/user/user.schema';
import { ProfileController } from './modules/profile/profile.controller';
import { BrandService } from './modules/brand/brand.service';
import { BrandController } from './modules/brand/brand.controller';
import { Brand, BrandSchema } from './modules/brand/brand.schema';
import { SeederService } from './database/seeder/seeder.service';
import { BaseResponse } from './utils/base-response';
import { GlobalService } from './global/global.service';
import { RoleService } from './modules/role/role.service';
import { RoleController } from './modules/role/role.controller';
import { Role, RoleSchema } from './modules/role/role.schema';
import { ModuleGuard } from './global/module.guard';
import { SupplierService } from './modules/supplier/supplier.service';
import { SupplierController } from './modules/supplier/supplier.controller';
import { ProductService } from './modules/product/product.service';
import { ProductController } from './modules/product/product.controller';
import { PurchasingService } from './modules/purchasing/purchasing.service';
import { PurchasingController } from './modules/purchasing/purchasing.controller';
import { Purchasing, PurchasingSchema } from './modules/purchasing/purchasing.schema';
import { GlobalController } from './global/global.controller';
import { PurchasingItemController } from './modules/purchasing-item/purchasing-item.controller';
import { PurchasingItemService } from './modules/purchasing-item/purchasing-item.service';
import { PurchasingItem, PurchasingItemSchema } from './modules/purchasing-item/purchasing-item.schema';
import { Trash, TrashSchema } from './global/global.schema';
import { ApprovalController } from './modules/approval/approval.controller';
import { InventoryItemController } from './modules/inventory-item/inventory-item.controller';
import { InventoryItemService } from './modules/inventory-item/inventory-item.service';
import { InventoryItem, InventoryItemSchema } from './modules/inventory-item/inventory-item.schema';
import { InventoryMovementController } from './modules/inventory-movement/inventory-movement.controller';
import { InventoryMovementService } from './modules/inventory-movement/inventory-movement.service';
import { InventoryMovement, InventoryMovementSchema } from './modules/inventory-movement/inventory-movement.schema';
import { AccountingService } from './modules/accounting/accounting.service';
import { InvestmentService } from './modules/investment/investment.service';
import { InvestmentController } from './modules/investment/investment.controller';
import { Investment, InvestmentSchema } from './modules/investment/investment.schema';
import { Accounting, AccountingSchema } from './modules/accounting/accounting.schema';
import { AccountingBalance, AccountingBalanceSchema } from './modules/accounting/accounting-balance.schema';
import { AccountingSnapshot, AccountingSnapshotSchema } from './modules/accounting/accounting-snapshot.schema';
import { ExpenseService } from './modules/expense/expense.service';
import { ExpenseController } from './modules/expense/expense.controller';
import { Expense, ExpenseSchema } from './modules/expense/expense.schema';
import { InventoryMovementItem, InventoryMovementItemSchema } from './modules/inventory-movement/inventory-movement-item.schema';
import { InventoryReconcile, InventoryReconcileSchema } from './modules/inventory-item/inventory-reconcile.schema';
import { SaleController } from './modules/sale/sale.controller';
import { SaleService } from './modules/sale/sale.service';
import { Sale, SaleSchema } from './modules/sale/sale.schema';
import { SaleItem, SaleItemSchema } from './modules/sale/sale-item.schema';
import { AccountingController } from './modules/accounting/accounting.controller';
import { ProductionController } from './modules/production/production.controller';
import { ProductionService } from './modules/production/production.service';
import { Production, ProductionSchema } from './modules/production/production.schema';
import { ProductionIngredient, ProductionIngredientSchema } from './modules/production/production-ingerdient.schema';
import { decimal128MoneyPlugin } from './database/plugins/decimal128-money.plugin';
import { PurchasingReceiveController } from './modules/purchasing-receive/purchasing-receive.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes .env accessible everywhere
      envFilePath: ['.env', '../.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        connectionFactory: (connection) => {
          connection.plugin(decimal128MoneyPlugin);
          return connection;
        },
      }),
    }),
    MailerModule.forRootAsync({
      useFactory: () => {
        const host = process.env.SMTP_HOST as string;
        const port = process.env.SMTP_PORT ? toNumber(process.env.SMTP_PORT) : undefined;
        const user = process.env.SMTP_USER as string;
        const pass = process.env.SMTP_PASS as string;
        return {
          transport: {
            host,
            port,
            auth: {
              user,
              pass,
            },
            ignoreTLS: true,
            secure: false,
            pool: true
          },
          defaults: {
            from: `"Acong Kelontong <No Reply>" <${process.env.SMTP_USER as string}>`,
            html: '<b>Hello</b>'
          },
          preview: true,
          template: {
            dir: __dirname + '/templates',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        }
      },
    }),
    MongooseModule.forFeature([
      { name: Trash.name, schema: TrashSchema },
      { name: Auth.name, schema: AuthSchema },
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
      { name: Brand.name, schema: BrandSchema },
      { name: Purchasing.name, schema: PurchasingSchema },
      { name: PurchasingItem.name, schema: PurchasingItemSchema },
      { name: InventoryItem.name, schema: InventoryItemSchema },
      { name: InventoryMovement.name, schema: InventoryMovementSchema },
      { name: InventoryMovementItem.name, schema: InventoryMovementItemSchema },
      { name: InventoryReconcile.name, schema: InventoryReconcileSchema },
      { name: Investment.name, schema: InvestmentSchema },
      { name: Accounting.name, schema: AccountingSchema },
      { name: AccountingBalance.name, schema: AccountingBalanceSchema },
      { name: AccountingSnapshot.name, schema: AccountingSnapshotSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: SaleItem.name, schema: SaleItemSchema },
      { name: Production.name, schema: ProductionSchema },
      { name: ProductionIngredient.name, schema: ProductionIngredientSchema },
    ]),
    SeederModule,
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    ProfileController,
    BrandController,
    RoleController,
    SupplierController,
    ProductController,
    PurchasingController,
    PurchasingItemController,
    GlobalController,
    ApprovalController,
    InventoryItemController,
    InventoryMovementController,
    InvestmentController,
    ExpenseController,
    SaleController,
    AccountingController,
    ProductionController,
    PurchasingReceiveController
  ],
  providers: [
    AppService,
    AuthService,
    UAuthGuard,
    ModuleGuard,
    UserService,
    BrandService,
    BaseResponse,
    GlobalService,
    RoleService,
    SupplierService,
    ProductService,
    PurchasingService,
    PurchasingItemService,
    InventoryItemService,
    InventoryMovementService,
    AccountingService,
    InvestmentService,
    ExpenseService,
    SaleService,
    ProductionService,
  ]
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seederService: SeederService) { }

  async onModuleInit() {
    await this.seederService.seedAll();
  }
}
