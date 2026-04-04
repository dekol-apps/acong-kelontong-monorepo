import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryItem, InventoryItemDocument } from 'src/modules/inventory-item/inventory-item.schema';
import { InventoryReconcile, InventoryDocument } from 'src/modules/inventory-item/inventory-reconcile.schema';
import { toSku } from 'src/utils/helper';

@Injectable()
export class InventoryReconcileSeederService {
  constructor(
    @InjectModel(InventoryItem.name) private readonly inventoryItemModel: Model<InventoryItemDocument>,
    @InjectModel(InventoryReconcile.name) private readonly reconcileModel: Model<InventoryDocument>,
  ) { }

  async run() {
    const existing = await this.reconcileModel.findOne({ description: 'Seed inventory reconcile snapshot' });
    if (existing) return;

    const inventoryItems = await this.inventoryItemModel.find().limit(50).lean();
    if (!inventoryItems.length) {
      console.warn('⚠️ No inventory items found for reconcile seeding');
      return;
    }

    const byProduct = new Map<string, { product: any; product_name: string; product_sku: string; item_qty: number }>();

    for (const item of inventoryItems) {
      const key = item.product.toString();
      const current = byProduct.get(key);
      if (!current) {
        byProduct.set(key, {
          product: item.product,
          product_name: item.product_name,
          product_sku: item.product_sku || toSku(item.product_name),
          item_qty: 1,
        });
      } else {
        current.item_qty += 1;
      }
    }

    const snapshotItems = Array.from(byProduct.values());

    await this.reconcileModel.create({
      description: 'Seed inventory reconcile snapshot',
      itemsBefore: snapshotItems,
      itemsAfter: snapshotItems,
    });

    console.info('🚀 Seeded Inventory Reconcile snapshot');
  }
}
