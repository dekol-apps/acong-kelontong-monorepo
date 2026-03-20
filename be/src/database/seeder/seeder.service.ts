import { Injectable } from '@nestjs/common';
import { UserSeederService } from './user-seeder/user-seeder.service';
import { SupplierSeederService } from './supplier-seeder/supplier-seeder.service';
import { ProductSeederService } from './product-seeder/product-seeder.service';
import { BalanceSeederService } from './balance-seeder/balance-seeder.service';

import { InventorySeederService } from './inventory-seeder/inventory-seeder.service';
import { InvestmentSeederService } from './investment-seeder/investment-seeder.service';
import { ExpenseSeederService } from './expense-seeder/expense-seeder.service';
import { PurchasingSeederService } from './purchasing-seeder/purchasing-seeder.service';
import { SaleSeederService } from './sale-seeder/sale-seeder.service';
import { ProductionSeederService } from './production-seeder/production-seeder.service';

@Injectable()
export class SeederService {
    constructor(
        private user: UserSeederService,
        private product: ProductSeederService,
        private supplier: SupplierSeederService,
        private balance: BalanceSeederService,
        private inventory: InventorySeederService,
        private investment: InvestmentSeederService,
        private expense: ExpenseSeederService,
        private purchasing: PurchasingSeederService,
        private sale: SaleSeederService,
        private production: ProductionSeederService,
    ) { }

    async seedAll() {
        console.info('🎬 Starting Seed Database...');
        await this.user.run();
        await this.supplier.run();
        await this.product.run();
        await this.inventory.run();
        await this.investment.run();
        await this.expense.run();
        await this.purchasing.run();
        await this.sale.run();
        await this.production.run();
        await this.balance.run();
        console.info('✅ Seed Database Finished');
    }
}
