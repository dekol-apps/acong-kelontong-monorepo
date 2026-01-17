import { Injectable } from '@nestjs/common';
import { UserSeederService } from './user-seeder/user-seeder.service';
import { SupplierSeederService } from './supplier-seeder/supplier-seeder.service';
import { ProductSeederService } from './product-seeder/product-seeder.service';
import { BalanceSeederService } from './balance-seeder/balance-seeder.service';

@Injectable()
export class SeederService {
    constructor(
        private user: UserSeederService,
        private product: ProductSeederService,
        private supplier: SupplierSeederService,
        private balance: BalanceSeederService
    ) { }

    async seedAll() {
        await this.user.run();
        await this.product.run();
        await this.supplier.run();
        await this.balance.run();
    }
}
