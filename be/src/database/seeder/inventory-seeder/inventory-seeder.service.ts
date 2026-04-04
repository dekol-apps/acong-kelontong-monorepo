import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from 'src/modules/product/product.schema';
import { InventoryItem, InventoryItemDocument } from 'src/modules/inventory-item/inventory-item.schema';
import { InventoryMovement, InventoryMovementDocument } from 'src/modules/inventory-movement/inventory-movement.schema';
import { FlowType, OrderType } from 'src/types/interfaces';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

@Injectable()
export class InventorySeederService {
    constructor(
        @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
        @InjectModel(InventoryItem.name) private readonly inventoryItemModel: Model<InventoryItemDocument>,
        @InjectModel(InventoryMovement.name) private readonly inventoryMovementModel: Model<InventoryMovementDocument>,
    ) { }

    async run() {
        const products = await this.productModel.find().limit(5);
        if (products.length === 0) {
            console.warn('⚠️ No products found for inventory seeding');
            return;
        }

        for (const product of products) {
            // Check if inventory already exists for this product
            const existing = await this.inventoryItemModel.findOne({ product: product._id });
            if (existing) continue;

            const inventoryItem = await this.inventoryItemModel.create({
                product: product._id,
                product_name: product.product_name,
                receive_date: new Date(),
                original_price: toDecimal128(toDecimal(5000)),
                landed_cost: toDecimal128(toDecimal(5550)),
                product_sku: product.product_sku,
            });

            await this.inventoryMovementModel.create({
                movement_type: FlowType.IN,
                order_type: OrderType.DEPOSIT,
                items: [{
                    ...inventoryItem.toObject(),
                    _id: inventoryItem._id,
                }],
                description: 'Initial stock seed',
            });

            console.info(`🚀 Seeded Inventory for: ${product.product_name}`);
        }
    }
}
