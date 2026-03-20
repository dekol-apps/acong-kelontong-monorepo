import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Production, ProductionDocument, ProductionEn } from 'src/modules/production/production.schema';
import { Product, ProductDocument } from 'src/modules/product/product.schema';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

@Injectable()
export class ProductionSeederService {
    constructor(
        @InjectModel(Production.name) private readonly productionModel: Model<ProductionDocument>,
        @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    ) { }

    async run() {
        const products = await this.productModel.find().limit(2);
        if (products.length < 2) {
            console.warn('⚠️ Not enough products for production seeding');
            return;
        }

        const existing = await this.productionModel.findOne();
        if (existing) return;

        const outputProduct = products[0];
        const ingredientProduct = products[1];

        await this.productionModel.create({
            product: outputProduct._id,
            item_qty: 10,
            price_per_item: toDecimal128(toDecimal(20000)),
            operational_cost: toDecimal128(toDecimal(50000)),
            grand_total_cost: toDecimal128(toDecimal(250000)),
            status: ProductionEn.FINISH,
            ingredients: [{
                product: ingredientProduct._id,
                item_qty: 20,
                total_cost: toDecimal128(toDecimal(200000)),
            }],
        });

        console.info(`🚀 Seeded Production for: ${String(outputProduct.product_name)}`);
    }
}
