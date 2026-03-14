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
      if (dto.movement_type === FlowType.IN) {
        // BURST: Insert N individual records based on item_qty to track COGS per item
        await Promise.all(dto.items.map(async item => {
          const newData = { ...item, inventory: dto.inventory, item_qty: 1 };
          // Loop and create N individual items
          for(let i = 0; i < item.item_qty; i++) {
            await this.inventoryItem.createInventoryItem(newData, session);
          }
        }));
      } else { // Move OUT
        // BURST: Find N individual records for this product and delete them
        await Promise.all(dto.items.map(async item => {
          const product = await this.productModel.findById(item.product).session(session).lean();
          const matchingItems = await this.inventoryItemModel.find({ 
            inventory: dto.inventory,
            product: item.product
          }).limit(item.item_qty).session(session);
          
          if (matchingItems.length < item.item_qty) {
            throw BaseResponse.invalid({ option: { message: `Insufficient stock for product ${product?.product_name ?? 'Unknown'}!` }, err: 'inventory move OUT no stock' })
          }

          // Delete the exact items we found (FIFO-ish based on natural insert order)
          for(const matchingItem of matchingItems) {
             await this.inventoryItem.deleteInventoryItem(matchingItem._id, session);
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
