import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Inventory } from './inventory.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { GlobalService } from 'src/global/global.service';
import { IListRes } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { InventoryDto, InventoryReconcileDto } from './inventory.dto';
import { InventoryItem } from '../inventory-item/inventory-item.schema';
import { InventoryItemService } from '../inventory-item/inventory-item.service';
import { InventoryMovementItem } from '../inventory-movement/inventory-movement-item.schema';
import { InventoryReconcile } from './inventory-reconcile.schema';
@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private readonly inventoryModel: Model<Inventory>,
    @InjectModel(InventoryItem.name) private inventoryItemModel: Model<InventoryItem>,
    @InjectModel(InventoryReconcile.name) private inventoryReconcileModel: Model<InventoryReconcile>,
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @Inject(forwardRef(() => InventoryItemService))
    private inventoryItem: InventoryItemService,
  ) { }

  async createInventory(data: InventoryDto, sessionIn?: ClientSession): Promise<Inventory | undefined> {
    return this.global.withTransaction(async (session) => {
      const inventory = await this.inventoryModel.create([{  // use array + session
        inventory_name: data.inventory_name,
        description: data.description,
        total_qty: 0,
      }], { session });
      const createdInventory = inventory[0];
      await createdInventory.save({ session });
      return this.detailInventory(createdInventory._id, session);
    }, sessionIn);
  }

  async listInventory({
    page,
    size,
    sortBy,
    sortDir,
    search,
  }: PaginationDto): Promise<IListRes<Inventory>> {
    const searchFields: string[] = ['product_name'];

    return this.global.getList<Inventory>(
      this.inventoryModel,
      {
        page,
        size,
        sortBy,
        sortDir,
        search,
        searchFields,
      }
    )
  }

  async editInventory(id: Types.ObjectId, data: InventoryDto, sessionIn?: ClientSession): Promise<Inventory | undefined> {
    return this.global.withTransaction(async (session) => {
      const updatedInventory = await this.inventoryModel.findByIdAndUpdate(
        id,
        { $set: data },
        {
          new: true,         // return the updated doc
          runValidators: true, // validate before saving
        },
      ).session(session);
      return updatedInventory || undefined;
    }, sessionIn);
  }

  async detailInventory(id: Types.ObjectId, sessionIn?: ClientSession): Promise<Inventory | undefined> {
    return this.global.withTransaction(async (session) => {
      const detailInventory = await this.inventoryModel.findById(id)
        .populate(['inventory_item', 'product'])
        .session(session)
        .lean()
        .exec();
      return detailInventory || undefined;
    }, sessionIn);
  }

  async deleteInventory(id: Types.ObjectId, sessionIn?: ClientSession): Promise<Inventory | undefined> {
    return this.global.withTransaction(async (session) => {
      const inventory = await this.inventoryModel.findById(id).session(session);
      if (!inventory) throw BaseResponse.notFound()
      const existingItems = await this.inventoryItemModel.exists({ inventory: id });
      if (existingItems) throw BaseResponse.forbidden({ err: 'deleteInventory existingItems', option: { message: 'Cannot delete: this inventory is not empty' } })
      await inventory.deleteOne({ session });
      return inventory || undefined;
    }, sessionIn);
  }


  async reconcile(dto: InventoryReconcileDto, sessionIn?: ClientSession): Promise<InventoryReconcile | undefined> {
    return this.global.withTransaction(async (session) => {
      const productIds = dto.items.map(i => i.product);
      const existingItems = await this.inventoryItemModel.find({
        inventory: dto.inventory,
        product: { $in: productIds },
      }).session(session);

      const itemMap = new Map(
        existingItems.map(i => [i.product.toString(), i]),
      );

      const itemsAfterReconcile: InventoryMovementItem[] = []

      await Promise.all(dto.items.map(async item => {
        const existing = itemMap.get(item.product.toString());
        let productName = existing?.product_name;

        if (!existing) {
          const newData = { ...item, inventory: dto.inventory };
          const newInv = await this.inventoryItem.createInventoryItem(newData, session);
          productName = newInv?.product_name;
        } else {
          const qtyCorrection = item.item_qty;
          if (qtyCorrection < 0) {
            throw BaseResponse.invalid({ option: { message: 'Quantity cannot be lesser than 0!' }, err: 'inventory reconcile invalid qty' })
          }

          if (qtyCorrection === 0) {
            await this.inventoryItem.deleteInventoryItem(existing._id, session);
          } else {
            await this.inventoryItem.editInventoryItem(
              existing._id,
              {
                inventory: existing.inventory,
                product: existing.product,
                item_qty: qtyCorrection,
              },
              session
            );
          }
        }

        const itemAfterRecon = {
          ...item,
          product: item.product,
          product_name: productName ?? 'Missing Product Name'
        }
        itemsAfterReconcile.push(itemAfterRecon)
      }));

      const data: InventoryReconcile = {
        inventory: dto.inventory,
        description: dto.description,
        itemsBefore: existingItems,
        itemsAfter: itemsAfterReconcile
      }

      return await this.inventoryReconcileModel.create(data)
    }, sessionIn)
  }
}
