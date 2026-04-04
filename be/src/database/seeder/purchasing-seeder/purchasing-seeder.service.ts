import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Purchasing, PurchasingDocument, PurchasingEn } from 'src/modules/purchasing/purchasing.schema';
import { PaymentStatusEn } from 'src/modules/purchasing/purchasing.schema';
import { PurchasingItem, PurchasingItemDocument } from 'src/modules/purchasing-item/purchasing-item.schema';
import { Supplier, SupplierDocument } from 'src/modules/supplier/supplier.schema';
import { Product, ProductDocument } from 'src/modules/product/product.schema';
import { PPnType } from 'src/types/interfaces';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

@Injectable()
export class PurchasingSeederService {
    constructor(
        @InjectModel(Purchasing.name) private readonly purchasingModel: Model<PurchasingDocument>,
        @InjectModel(PurchasingItem.name) private readonly purchasingItemModel: Model<PurchasingItemDocument>,
        @InjectModel(Supplier.name) private readonly supplierModel: Model<SupplierDocument>,
        @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    ) { }

    async run() {
        const supplier = await this.supplierModel.findOne();
        const products = await this.productModel.find().limit(3);

        if (!supplier || products.length === 0) {
            console.warn('⚠️ No supplier or products found for purchasing seeding');
            return;
        }

        const purchasing = await this.purchasingModel.findOneAndUpdate(
            { supplier: supplier._id, notes: 'Seeded purchasing dummy data' },
            {
                $set: {
                    supplier: supplier._id,
                    supplier_name: supplier.supplier_name,
                    status: PurchasingEn.COMPLETE,
                    payment_status: PaymentStatusEn.PAID,
                    ppn_type: PPnType.INCLUSIVE,
                    ppn_rate: 11,
                    ppn_amount: toDecimal128(toDecimal(29729.73)),
                    shipping_cost: toDecimal128(toDecimal(10000)),
                    payment_realization: toDecimal128(toDecimal(310000)),
                    paid_total: toDecimal128(toDecimal(310000)),
                    completed_date: new Date(),
                    notes: 'Seeded purchasing dummy data',
                },
            },
            { upsert: true, new: true }
        );

        for (const product of products) {
            await this.purchasingItemModel.updateOne(
                { purchase_order: purchasing._id, product: product._id },
                {
                    $set: {
                        purchase_order: purchasing._id,
                        product: product._id,
                        product_name: product.product_name,
                        product_sku: product.product_sku,
                        supplier_name: supplier.supplier_name,
                        purchase_qty: 10,
                        received_qty: 10,
                        purchase_price: toDecimal128(toDecimal(10000)),
                    },
                },
                { upsert: true }
            );
        }

        console.info(`🚀 Seeded Purchasing: ${String(purchasing._id)} for ${supplier.supplier_name}`);
    }
}
