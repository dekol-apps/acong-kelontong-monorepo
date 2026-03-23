import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { InventoryItem } from '../inventory-item/inventory-item.schema';
import { FlowType, IListRes, OrderType } from 'src/types/interfaces';
import { InventoryMovementDto, ListInventoryMovementDTO, MovedInventoryItemData } from './inventory-movement.dto';
import { BaseResponse } from 'src/utils/base-response';
import { InventoryItemService } from '../inventory-item/inventory-item.service';
import { InventoryMovement } from './inventory-movement.schema';
import { Product } from '../product/product.schema';
import { InventoryMovementItem } from './inventory-movement-item.schema';
import { GInventoryItemDto, InventoryItemDto } from '../inventory-item/inventory-item.dto';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

/** Snapshot of an InventoryItem captured just before it is deleted, returned by moveOutByItemIds */

@Injectable()
export class InventoryMovementService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @Inject(forwardRef(() => InventoryItemService))
    private inventoryItem: InventoryItemService,
    @InjectModel(InventoryItem.name) private inventoryItemModel: Model<InventoryItem>,
    @InjectModel(InventoryMovement.name) private inventoryMovementModel: Model<InventoryMovement>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) { }

  async createInventoryMovement(dto: InventoryMovementDto & { source_id?: Types.ObjectId }, sessionIn?: ClientSession): Promise<InventoryMovement | undefined> {
    return this.global.withTransaction(async (session) => {
      const data: InventoryMovement = {
        movement_type: dto.movement_type,
        items: [],
        description: dto.description,
        order_type: dto.order_type,
        source_id: dto.source_id
      }
      await Promise.all(dto.items.map(async item => {
        const product = await this.productModel.findById(item.product).session(session).lean();
        if (!product) {
          throw BaseResponse.invalid({ option: { message: 'Product not found' }, err: 'createInventoryMovement !product' });
        }
        const { ppn } = this.global.getPPnAmount({
          net_price: item.original_price,
          ppn_rate: item.original_ppn_rate
        });
        const movementItem = {
          product: item.product,
          receive_date: item.receive_date,
          product_name: product?.product_name,
          original_price: item.original_price,
          original_ppn_rate: item.original_ppn_rate,
          original_ppn_amount: toDecimal128(ppn),
          landed_cost: item.landed_cost,
        }
        data.items.push(movementItem);
      }))
      const created = (await this.inventoryMovementModel.create([data], { session }))[0];
      if (!created) throw BaseResponse.notFound({ err: 'createInventoryMovement created not found' });
      return created;
    }, sessionIn)
  }

  async move(dto: InventoryMovementDto & { source_id?: Types.ObjectId }, sessionIn?: ClientSession): Promise<InventoryMovement | undefined> {
    return this.global.withTransaction(async (session) => {
      if (dto.movement_type === FlowType.IN) {
        // BURST: Insert N individual records based on items.length to track landed_cost per item
        await Promise.all(dto.items.map(async item => {
          const { ppn } = this.global.getPPnAmount({
            net_price: item.original_price,
            ppn_rate: item.original_ppn_rate
          });
          const newData: InventoryItemDto = {
            product: item.product,
            receive_date: item.receive_date,
            original_price: item.original_price,
            original_ppn_rate: item.original_ppn_rate,
            original_ppn_amount: toDecimal128(ppn),
            landed_cost: item.landed_cost,
          };
          // Loop and create N individual items
          for (let i = 0; i < item.item_qty; i++) {
            await this.inventoryItem.createInventoryItem(newData, session);
          }
        }));
      } else { // Move OUT
        // BURST: Find N individual records for this product and delete them
        await Promise.all(dto.items.map(async item => {
          const product = await this.productModel.findById(item.product).session(session).lean();
          const matchingItems = await this.inventoryItemModel.find({
            product: item.product //sort by receive_date oldest to newest
          }).sort({ receive_date: 'ascending' }).limit(item.item_qty).session(session);

          if (matchingItems.length < item.item_qty) {
            throw BaseResponse.invalid({ option: { message: `Insufficient stock for product ${product?.product_name ?? 'Unknown'}!` }, err: 'inventory move OUT no stock' })
          }

          // Delete the exact items we found (FIFO-ish based on natural insert order)
          for (const matchingItem of matchingItems) {
            await this.inventoryItem.deleteInventoryItem(matchingItem._id, session);
          }
        }));
      }
      const result = await this.createInventoryMovement(dto, session);
      return result;
    }, sessionIn)
  }

  /**
   * Move OUT specific individual InventoryItem records by their exact document IDs.
   *
   * Unlike `move(OUT)` (which picks FIFO), this method lets the caller choose
   * exactly which physical units leave inventory — enabling precise COGS tracking
   * because each item's `landed_cost` is captured before deletion.
   *
   * Returns the movement record and the captured item data (including landed_cost).
   */
  async moveOutByItemIds(
    dto: {
      order_type: OrderType;
      description?: string;
      source_id?: Types.ObjectId;
    },
    inventoryItemIds: Types.ObjectId[],
    sessionIn?: ClientSession,
  ): Promise<{ movement: InventoryMovement; movedItems: MovedInventoryItemData[] } | undefined> {
    return this.global.withTransaction(async (session) => {
      const movedItems: MovedInventoryItemData[] = [];

      // Validate and capture each item's data before deleting
      for (const itemId of inventoryItemIds) {
        const inventoryItem = await this.inventoryItemModel
          .findOne({ _id: itemId })
          .session(session);

        if (!inventoryItem) {
          throw BaseResponse.invalid({
            option: { message: `InventoryItem ${itemId.toString()} not found in the specified inventory` },
            err: 'moveOutByItemIds item not found',
          });
        }

        const { ppn } = this.global.getPPnAmount({
          net_price: inventoryItem.original_price,
          ppn_rate: inventoryItem.original_ppn_rate
        });

        // Capture the data (including landed_cost for COGS) before removal
        movedItems.push({
          _id: inventoryItem._id,
          product: inventoryItem.product,
          receive_date: inventoryItem.receive_date,
          product_name: inventoryItem.product_name,
          original_price: inventoryItem.original_price,
          original_ppn_rate: inventoryItem.original_ppn_rate,
          original_ppn_amount: toDecimal128(ppn),
          landed_cost: inventoryItem.landed_cost,
        });

        await inventoryItem.deleteOne({ session });
      }

      // Build a grouped movement summary (one entry per unique product)
      const productMap = new Map<string, GInventoryItemDto>();
      for (const item of movedItems) {
        const { ppn } = this.global.getPPnAmount({
          net_price: item.original_price,
          ppn_rate: item.original_ppn_rate
        });
        const key = item.product.toString();
        if (!productMap.has(key)) {
          productMap.set(key, {
            product: item.product,
            receive_date: item.receive_date,
            original_price: item.original_price,
            original_ppn_rate: item.original_ppn_rate,
            original_ppn_amount: toDecimal128(ppn),
            landed_cost: item.landed_cost,
            item_qty: 1,
          });
        }
      }

      const movementData: InventoryMovementDto & { source_id?: Types.ObjectId } = {
        movement_type: FlowType.OUT,
        order_type: dto.order_type,
        items: Array.from(productMap.values()),
        description: dto.description,
        source_id: dto.source_id,
      };

      const movement = await this.createInventoryMovement(movementData, session);
      if (!movement) throw BaseResponse.notFound({ err: 'moveOutByItemIds movement not created' });

      return { movement, movedItems };
    }, sessionIn);
  }

  /**
   * Move OUT inventory items selected automatically via FIFO for each product.
   *
   * For each entry in `items`, the oldest N InventoryItem records (by natural
   * insert order) for the given product inside the specified inventory are
   * captured and deleted.  Their `landed_cost` values are returned so the
   * caller can use them as COGS data.
   *
   * Throws if there is insufficient stock for any product.
   */
  async moveOutByProductAndQty(
    dto: {
      order_type: OrderType;
      description?: string;
      source_id?: Types.ObjectId;
    },
    items: Array<{ product: Types.ObjectId; item_qty: number }>,
    sessionIn?: ClientSession,
  ): Promise<{ movement: InventoryMovement; movedItems: MovedInventoryItemData[] } | undefined> {
    return this.global.withTransaction(async (session) => {
      const movedItems: MovedInventoryItemData[] = [];

      for (const item of items) {
        // FIFO: pick the oldest N items for this product
        const candidates = await this.inventoryItemModel
          .find({ product: item.product })
          .limit(item.item_qty)
          .session(session);

        if (candidates.length < item.item_qty) {
          const productDoc = await this.productModel
            .findById(item.product)
            .session(session)
            .lean();
          throw BaseResponse.invalid({
            option: {
              message: `Insufficient stock for product "${productDoc?.product_name ?? item.product.toString()}"`,
            },
            err: 'moveOutByProductAndQty insufficient stock',
          });
        }

        for (const candidate of candidates) {
          const { ppn } = this.global.getPPnAmount({
            net_price: candidate.original_price,
            ppn_rate: candidate.original_ppn_rate
          });
          movedItems.push({
            _id: candidate._id,
            product: candidate.product,
            receive_date: candidate.receive_date,
            product_name: candidate.product_name,
            original_price: candidate.original_price,
            original_ppn_rate: candidate.original_ppn_rate,
            original_ppn_amount: toDecimal128(ppn),
            landed_cost: candidate.landed_cost,
          });
          await candidate.deleteOne({ session });
        }
      }

      // Build a grouped movement summary (one entry per unique product)
      const productMap = new Map<string, InventoryMovementItem>();
      for (const item of movedItems) {
        const key = item.product.toString();
        const { ppn } = this.global.getPPnAmount({
          net_price: item.original_price,
          ppn_rate: item.original_ppn_rate
        });
        if (!productMap.has(key)) {
          productMap.set(key, {
            product: item.product,
            receive_date: item.receive_date,
            product_name: item.product_name,
            original_price: item.original_price,
            original_ppn_rate: item.original_ppn_rate,
            original_ppn_amount: toDecimal128(ppn),
            landed_cost: item.landed_cost,
          });
        }
      }

      const movementData: InventoryMovement = {
        movement_type: FlowType.OUT,
        order_type: dto.order_type,
        items: Array.from(productMap.values()),
        description: dto.description,
        source_id: dto.source_id,
      };

      const [movement] = await this.inventoryMovementModel.create([movementData], { session });
      if (!movement) throw BaseResponse.notFound({ err: 'moveOutByProductAndQty movement not created' });

      return { movement, movedItems };
    }, sessionIn);
  }

  async listInventoryMovement({
    movement_type,
    page,
    size,
    sortBy,
    sortDir,
    search,
  }: ListInventoryMovementDTO): Promise<IListRes<InventoryMovement>> {
    const searchFields: string[] = ['order_type', 'description'];
    const filter = { column: 'movement_type', value: movement_type?.toString() };

    const res = await this.global.getList<InventoryMovement>(
      this.inventoryMovementModel,
      {
        page,
        size,
        sortBy,
        sortDir,
        search,
        searchFields,
        filter,
      }
    )
    return res;
  }

  async detailInventoryMovement(id: Types.ObjectId, sessionIn?: ClientSession): Promise<InventoryMovement | undefined> {
    return this.global.withTransaction(async (session) => {
      const detailInventory = await this.inventoryMovementModel
        .findById(id)
        .session(session)
        .populate({
          path: 'items.product',
          populate: {
            path: 'brand'
          }
        })
        .lean()
        .exec();
      return detailInventory || undefined
    }, sessionIn);
  }
}
