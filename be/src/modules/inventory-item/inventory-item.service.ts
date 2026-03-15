import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { BaseResponse } from 'src/utils/base-response';
import { Product } from '../product/product.schema';
import { InventoryItemDto, InventoryReconcileDto } from './inventory-item.dto';
import { InventoryItem } from './inventory-item.schema';
import { IListRes } from 'src/types/interfaces';
import { PaginationDto } from 'src/global/global.dto';
import { InventoryReconcile, InventoryReconcileItem } from './inventory-reconcile.schema';

@Injectable()
export class InventoryItemService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @InjectModel(InventoryReconcile.name) private inventoryReconcileModel: Model<InventoryReconcile>,
    @InjectModel(InventoryItem.name) private inventoryItemModel: Model<InventoryItem>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) { }

  async listInventoryItems({
    page,
    size,
    sortBy,
    sortDir,
    search,
  }: PaginationDto): Promise<IListRes<any>> {
    const pageNum = page ? Math.max(1, page) : 1;
    const pageSize = size ? Math.max(1, size) : 10;
    const skip = (pageNum - 1) * pageSize;

    // Build matching stage
    const matchStage: any = {};
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
          // Option to track average landed_cost across batch
          avg_landed_cost: { $avg: { $toDecimal: "$landed_cost" } }
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

  async createInventoryItem(payload: InventoryItemDto, sessionIn?: ClientSession): Promise<InventoryItem | undefined> {
    return this.global.withTransaction(async (session) => {
      const product = await this.productModel.findById(payload.product).session(session);
      if (!product) {
        throw BaseResponse.notFound({ err: `createInventoryItem Product not found` });
      }
      const data = {
        product: payload.product,
        product_name: product.product_name,
        receive_date: payload.receive_date,
        original_price: payload.original_price,
        original_ppn_rate: payload.original_ppn_rate,
        landed_cost: payload.landed_cost,
      }
      const created = (await this.inventoryItemModel.create([data], { session }))[0];
      if (!created) throw BaseResponse.notFound({ err: 'createInventoryItem created not found' });
      return created;
    }, sessionIn)
  }

  async editInventoryItem(
    id: Types.ObjectId,
    dto: InventoryItemDto,
    sessionIn?: ClientSession
  ): Promise<InventoryItem | undefined> {
    return this.global.withTransaction(async (session) => {
      const product = await this.productModel.findById(dto.product).session(session);
      if (!product) throw BaseResponse.notFound({ err: `editInventoryItem Product not found` });
      const data = {
        product: dto.product,
        product_name: product.product_name,
        receive_date: dto.receive_date,
        original_price: dto.original_price,
        original_ppn_rate: dto.original_ppn_rate,
        landed_cost: dto.landed_cost,
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
      await inventoryItem.deleteOne({ session });
      return inventoryItem || undefined;
    }, sessionIn);
  }

  async reconcile(dto: InventoryReconcileDto, sessionIn?: ClientSession): Promise<InventoryReconcile | undefined> {
    return this.global.withTransaction(async (session) => {
      const productIds = dto.items.map(i => i.product);
      const existingItems = await this.inventoryItemModel.find({
        product: { $in: productIds },//sort by receive_date oldest to newest
      }).sort({ receive_date: 'ascending' }).session(session);

      const itemsAfterReconcile: InventoryReconcileItem[] = []

      await Promise.all(dto.items.map(async item => {
        for (const existingItem of existingItems) {
          if (existingItem.product.toString() === item.product.toString()) {
            const qtyCorrection = item.item_qty;
            if (qtyCorrection < 0) {
              throw BaseResponse.invalid({ option: { message: 'Quantity cannot be lesser than 0!' }, err: 'inventory reconcile invalid qty' })
            }
            const existingItemsByProduct = existingItems.filter(i => i.product.toString() === item.product.toString());
            //delete existing item by qtyCorrection
            if (qtyCorrection < existingItemsByProduct.length) {
              for (let i = 0; i < existingItemsByProduct.length - qtyCorrection; i++) {
                await this.deleteInventoryItem(existingItemsByProduct[i]._id, session);
              }
            }
            const productName = existingItem?.product_name;
            const itemAfterRecon = {
              product: item.product,
              item_qty: item.item_qty,
              product_name: productName ?? 'Missing Product Name'
            }
            itemsAfterReconcile.push(itemAfterRecon)
          }
        }
      }));

      const itemsBefore: InventoryReconcileItem[] = existingItems.map((item: InventoryItem) => {
        return {
          product: item.product,
          product_name: item.product_name,
          item_qty: existingItems.filter(i => i.product.toString() === item.product.toString()).length,
        }
      });
      const itemsBeforeReconcile = itemsBefore.filter((item, index) => itemsBefore.findIndex(i => i.product.toString() === item.product.toString()) === index);

      const data: InventoryReconcile = {
        description: dto.description,
        itemsBefore: itemsBeforeReconcile,
        itemsAfter: itemsAfterReconcile
      }

      return await this.inventoryReconcileModel.create(data)
    }, sessionIn)
  }
}
