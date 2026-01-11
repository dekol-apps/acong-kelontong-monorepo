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
import { InventoryController } from './modules/inventory/inventory.controller';
import { InventoryService } from './modules/inventory/inventory.service';
import { Inventory, InventorySchema } from './modules/inventory/inventory.schema';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes .env accessible everywhere
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
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
      { name: Inventory.name, schema: InventorySchema },
      { name: InventoryItem.name, schema: InventoryItemSchema },
      { name: InventoryMovement.name, schema: InventoryMovementSchema },
    ]),
    SeederModule,
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    BrandController,
    RoleController,
    SupplierController,
    ProductController,
    PurchasingController,
    PurchasingItemController,
    GlobalController,
    InventoryController,
    ApprovalController,
    InventoryItemController,
    InventoryMovementController
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
    InventoryService,
    PurchasingItemService,
    InventoryItemService,
    InventoryMovementService,
  ]
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seederService: SeederService) { }

  async onModuleInit() {
    await this.seederService.seedAll();
  }
}
