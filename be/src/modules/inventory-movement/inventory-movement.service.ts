import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { InventoryItem } from '../inventory-item/inventory-item.schema';
import { Inventory } from '../inventory/inventory.schema';
import { InventoryMovementDto, ListInventoryMovementDTO } from './inventory-movement.dto';
import { BaseResponse } from 'src/utils/base-response';
import { InventoryItemService } from '../inventory-item/inventory-item.service';
import { InventoryMovement } from './inventory-movement.schema';
import { Product } from '../product/product.schema';
import { FlowType, IListRes } from 'src/types/interfaces';
import { InventoryMovementItem } from './inventory-movement-item.schema';

@Injectable()
export class InventoryMovementService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @Inject(forwardRef(() => InventoryItemService))
    private inventoryItem: InventoryItemService,
    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
    @InjectModel(InventoryItem.name) private inventoryItemModel: Model<InventoryItem>,
    @InjectModel(InventoryMovement.name) private inventoryMovementModel: Model<InventoryMovement>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) { }

  async createInventoryMovement(dto: InventoryMovementDto & { source_id?: Types.ObjectId }, sessionIn?: ClientSession): Promise<InventoryMovement | undefined> {
    return this.global.withTransaction(async (session) => {
      const inventory = await this.inventoryModel.exists(dto.inventory).session(session);
      if (!inventory) {
        throw BaseResponse.notFound({ err: `createInventoryMovement Inventory not found` });
      }
      const data: InventoryMovement = {
        inventory: dto.inventory,
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
        const movementItem: InventoryMovementItem = {
          product: item.product,
          product_name: product?.product_name,
          item_qty: item.item_qty
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
      const productIds = dto.items.map(i => i.product);
      const existingItems = await this.inventoryItemModel.find({
        inventory: dto.inventory,
        product: { $in: productIds },
      }).session(session);

      const itemMap = new Map(
        existingItems.map(i => [i.product.toString(), i]),
      );
      if (dto.movement_type === FlowType.IN) {
        // If any item in the payload list is already available in DB, it means user intends to increment it's quantity
        await Promise.all(dto.items.map(async item => {
          const existing = itemMap.get(item.product.toString());
          const newData = { ...item, inventory: dto.inventory };
          if (!existing) {
            await this.inventoryItem.createInventoryItem(newData, session);
          } else {
            await this.inventoryItem.editInventoryItem(
              existing._id,
              {
                inventory: existing.inventory,
                product: existing.product,
                item_qty: existing.item_qty + item.item_qty,
              },
              session
            );
          }
        }));
      } else { // Move OUT
        // If any item in the payload list is already available in DB, it means user intends to decrement it's quantity
        await Promise.all(dto.items.map(async item => {
          const existing = itemMap.get(item.product.toString());
          if (!existing) {
            throw BaseResponse.invalid({ option: { message: 'Product not found in inventory' }, err: 'inventory move OUT !existing' });
          }
          const decQtyResult = existing.item_qty - item.item_qty;
          if (decQtyResult < 0) {
            throw BaseResponse.invalid({ option: { message: 'Insufficient stock!' }, err: 'inventory move OUT no stock' })
          }

          if (decQtyResult === 0) {
            await this.inventoryItem.deleteInventoryItem(existing._id, session);
          } else {
            await this.inventoryItem.editInventoryItem(
              existing._id,
              {
                inventory: existing.inventory,
                product: existing.product,
                item_qty: decQtyResult,
              },
              session
            );
          }
        }));
      }
      const result = await this.createInventoryMovement(dto, session);
      return result;
    }, sessionIn)
  }

  async listInventoryMovement({
    movement_type,
    page,
    size,
    sortBy,
    sortDir,
    search,
  }: ListInventoryMovementDTO): Promise<IListRes<InventoryMovement>> {
    const searchFields: string[] = ['product_name', 'description', 'item_qty'];
    const filter = { column: 'movement_type', value: movement_type };

    return this.global.getList<InventoryMovement>(
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
  }

  async detailInventoryMovement(id: Types.ObjectId, sessionIn?: ClientSession): Promise<InventoryMovement | undefined> {
    return this.global.withTransaction(async (session) => {
      const detailInventory = await this.inventoryMovementModel
        .findById(id)
        .session(session)
        .populate(['inventory', 'product'])
        .lean()
        .exec();
      return detailInventory || undefined
    }, sessionIn);
  }
}
