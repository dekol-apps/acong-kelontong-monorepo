import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale, SaleDocument } from 'src/modules/sale/sale.schema';
import { Product, ProductDocument } from 'src/modules/product/product.schema';
import { Brand, BrandDocument } from 'src/modules/brand/brand.schema';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

@Injectable()
export class SaleSeederService {
    constructor(
        @InjectModel(Sale.name) private readonly saleModel: Model<SaleDocument>,
        @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
        @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
    ) { }

    async run() {
        const product = await this.productModel.findOne().populate('brand');
        if (!product) {
            console.warn('⚠️ No products found for sale seeding');
            return;
        }

        const existing = await this.saleModel.findOne();
        if (existing) return;

        const brand = product.brand as unknown as BrandDocument;

        await this.saleModel.create({
            items: [{
                product: product._id,
                brand_name: brand?.brand_name || 'Unknown',
                product_name: product.product_name,
                product_sku: product.product_sku,
                barcode: product.barcode,
                original_price: toDecimal128(toDecimal(5000)),
                original_ppn_rate: 11,
                original_ppn_amount: toDecimal128(toDecimal(550)),
                sale_price: toDecimal128(toDecimal(15000)),
                discount_percent: 0,
                discount_amount: toDecimal128(toDecimal(0)),
                cogs: toDecimal128(toDecimal(5550)),
            }],
            total_discount: toDecimal128(toDecimal(0)),
            total_cogs: toDecimal128(toDecimal(5550)),
            total_before_tax: toDecimal128(toDecimal(15000)),
            total_ppn: toDecimal128(toDecimal(1650)),
            grand_total: toDecimal128(toDecimal(16650)),
            ppn_rate: 11,
        });

        console.info(`🚀 Seeded Sale for: ${String(product.product_name)}`);
    }
}
