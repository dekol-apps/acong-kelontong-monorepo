import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Inventory } from './inventory.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { GlobalService } from 'src/global/global.service';
import { IPaginationRes } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { InventoryDto, ListInventoryItemsDTO } from './inventory.dto';
import { InventoryItem } from '../inventory-item/inventory-item.schema';
@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private readonly inventoryModel: Model<Inventory>,
    @InjectModel(InventoryItem.name) private inventoryItemModel: Model<InventoryItem>,
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService
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
  }: PaginationDto): Promise<{ data: Inventory[]; meta: IPaginationRes }> {
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
      await this.global.deleteData(inventory, session);
      return inventory || undefined;
    }, sessionIn);
  }

    async listInventoryItems({
      inventory_id,
      page,
      size,
      sortBy,
      sortDir,
      search,
    }: ListInventoryItemsDTO): Promise<{ data: InventoryItem[]; meta: IPaginationRes }> {
      const searchFields: string[] = ['product_name'];
      const filter: { column: string, value: any } = { column: 'inventory', value: inventory_id }
  
      return this.global.getList<InventoryItem>(
        this.inventoryItemModel,
        {
          page,
          size,
          sortBy,
          sortDir,
          search,
          searchFields,
          filter
        }
      )
    }
  
}
