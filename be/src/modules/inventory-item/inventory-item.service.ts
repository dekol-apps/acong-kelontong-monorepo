import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { BaseResponse } from 'src/utils/base-response';
import { Inventory } from '../inventory/inventory.schema';
import { Product } from '../product/product.schema';
import { InventoryItemDto, ListInventoryItemsDTO } from './inventory-item.dto';
import { InventoryItem } from './inventory-item.schema';
import { IListRes } from 'src/types/interfaces';

@Injectable()
export class InventoryItemService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
    @InjectModel(InventoryItem.name) private inventoryItemModel: Model<InventoryItem>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) { }

  async listInventoryItems({
    inventory_id,
    page,
    size,
    sortBy,
    sortDir,
    search,
  }: ListInventoryItemsDTO): Promise<IListRes<any>> {
    const pageNum = page ? Math.max(1, page) : 1;
    const pageSize = size ? Math.max(1, size) : 10;
    const skip = (pageNum - 1) * pageSize;

    // Build matching stage
    const matchStage: any = {
      inventory: new Types.ObjectId(inventory_id)
    };
    if (search) {
      matchStage['product_name'] = { $regex: search, $options: 'i' };
    }

    const sortStage: any = {};
    if (sortBy) {
      sortStage[sortBy] = sortDir === 'desc' ? -1 : 1;
    } else {
      sortStage['product_name'] = 1; // Default
    }

    // 1. Group records representing 1 physical item into a frontend aggregate summary
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $group: {
          _id: "$product",
          product: { $first: "$product" },
          product_name: { $first: "$product_name" },
          inventory: { $first: "$inventory" },
          item_qty: { $sum: 1 }, 
          // Option to track average COGS across batch
          avg_cogs: { $avg: { $toDecimal: "$cogs" } }
        }
      },
      { $sort: sortStage },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: pageSize }],
          totalCount: [{ $count: "count" }]
        }
      }
    ];

    const result = await this.inventoryItemModel.aggregate(pipeline).exec();
    const data = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    return {
      data,
      meta: {
        total,
        page: pageNum,
        size: pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    };
  }

  async createInventoryItem(dto: InventoryItemDto, sessionIn?: ClientSession): Promise<InventoryItem | undefined> {
    return this.global.withTransaction(async (session) => {
      const product = await this.productModel.findById(dto.product).session(session);
      if (!product) {
        throw BaseResponse.notFound({ err: `createInventoryItem Product not found` });
      }
      const inventory = await this.inventoryModel.exists(dto.inventory).session(session);
      if (!inventory) {
        throw BaseResponse.notFound({ err: `createInventoryItem Inventory not found` });
      }
      const data = {
        ...dto,
        product_name: product.product_name,
      }
      const created = (await this.inventoryItemModel.create([data], { session }))[0];
      if (!created) throw BaseResponse.notFound({ err: 'createInventoryItem created not found' });
      await this.updateInventoryTotalQuantity(created?.inventory, session);
      return created;
    }, sessionIn)
  }

  async editInventoryItem(
    id: Types.ObjectId,
    dto: InventoryItemDto,
    sessionIn?: ClientSession
  ): Promise<InventoryItem | undefined> {
    return this.global.withTransaction(async (session) => {
      const inventory = await this.inventoryModel.exists(dto.inventory).session(session);
      if (!inventory) {
        throw BaseResponse.notFound({ err: `editInventoryItem Inventory not found` });
      }
      const product = await this.productModel.findById(dto.product).session(session);
      if (!product) throw BaseResponse.notFound({ err: `editInventoryItem Product not found` });
      const data = {
        ...dto,
        product_name: product.product_name,
      }
      const updatedItem = await this.inventoryItemModel.findByIdAndUpdate(
        id,
        { $set: data },
        {
          new: true,
          runValidators: true,
        },
      ).session(session);
      if (!updatedItem) throw BaseResponse.notFound({ err: 'editInventoryItem updatedItem not found' });
      await this.updateInventoryTotalQuantity(updatedItem?.inventory, session);
      return updatedItem || undefined;
    }, sessionIn);
  }

  async detailInventoryItem(id: Types.ObjectId, sessionIn?: ClientSession): Promise<InventoryItem | undefined> {
    return this.global.withTransaction(async (session) => {
      const detailInventory = await this.inventoryItemModel
        .findById(id)
        .session(session)
        .populate(['inventory', 'product'])
        .lean()
        .exec();
      return detailInventory || undefined
    }, sessionIn);
  }

  async deleteInventoryItem(inventory_id: Types.ObjectId, sessionIn?: ClientSession): Promise<InventoryItem | undefined> {
    return this.global.withTransaction(async (session) => {
      const inventoryItem = await this.inventoryItemModel.findById(inventory_id).session(session);
      if (!inventoryItem) throw BaseResponse.notFound({ err: 'deleteInventoryItem not found' });
      await this.updateInventoryTotalQuantity(inventory_id, session);
      await inventoryItem.deleteOne({ session });
      return inventoryItem || undefined;
    }, sessionIn);
  }

  async updateInventoryTotalQuantity(inventory_id: Types.ObjectId, sessionIn?: ClientSession): Promise<Inventory | undefined> {
    return this.global.withTransaction(async (session) => {
      const inventory = await this.inventoryModel.findById(inventory_id).session(session);
      if (!inventory) throw BaseResponse.notFound({ err: 'Inventory not found' });
      const items = await this.inventoryItemModel.find({ inventory: inventory_id }).session(session).lean();
      if (!items || items.length < 1) {
        return inventory;
      }
      inventory.total_qty = items.length;
      const result = await inventory.save({ session });
      return result
    }, sessionIn)
  }
}
