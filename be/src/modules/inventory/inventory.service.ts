import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Inventory, InventoryEn } from './inventory.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { GlobalService } from 'src/global/global.service';
import { IPaginationRes } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { InventoryDto } from './inventory.dto';
import { digitShortDate } from 'src/utils/helper';
import { PurchasingItem } from '../purchasing-item/purchasing-item.schema';
@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private readonly inventoryModel: Model<Inventory>,
    @InjectModel(PurchasingItem.name) private purchasingItemModel: Model<PurchasingItem>,
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService
  ) { }

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

  async createInventory(body: InventoryDto, sessionIn?: ClientSession): Promise<Inventory> {
    return this.global.withTransaction(async (session) => {
      const poItem = await this.purchasingItemModel.findById(body.purchase_item).session(session);
      if (!poItem) throw BaseResponse.notFound({ err: 'createInventory poItem not found' });

      const batchCode = `${digitShortDate(new Date())}-${poItem.product_name.replace(/\s+/g, '_')}-${poItem._id.toString().slice(-4)}`;

      const data: Inventory = {
        purchase_item: body.purchase_item,
        supplier_name: poItem.supplier_name,
        product: poItem.product,
        product_name: poItem.product_name,
        exp_date: poItem.exp_date,
        purchase_price: poItem.purchase_price,
        sell_price: poItem.sell_price,
        item_qty: poItem.recieved_qty,
        remaining_qty: poItem.recieved_qty,
        batch_code: batchCode,
        status: InventoryEn.HALT,
      };

      return (await this.inventoryModel.create([data], { session }))[0];
    }, sessionIn)
  }


  async editInventory(id: Types.ObjectId, data: InventoryDto): Promise<Inventory | undefined> {
    try {
      const updatedInventory = await this.inventoryModel.findByIdAndUpdate(
        id,
        { $set: data },
        {
          new: true,         // return the updated doc
          runValidators: true, // validate before saving
        },
      ).exec();
      return updatedInventory || undefined;
    } catch (err) {
      throw BaseResponse.unexpected({ err: { text: 'editInventory catch', err } })
    }
  }

  async detailInventory(id: Types.ObjectId): Promise<Inventory | undefined> {
    try {
      const detailInventory = await this.inventoryModel.findById(id)
        .populate(['purchase_item', 'product'])
        .lean()
        .exec();
      return detailInventory || undefined;
    } catch (err) {
      throw BaseResponse.unexpected({ err: { text: 'detailInventory catch', err } })
    }
  }

  async deleteInventory(id: Types.ObjectId): Promise<Inventory | undefined> {
    try {
      const inventory = await this.inventoryModel.findById(id);
      if (!inventory) throw BaseResponse.notFound()
      await this.global.deleteData(inventory);
      return inventory || undefined;
    } catch (err) {
      throw BaseResponse.unexpected({ err: { text: 'deleteInventory catch', err } })
    }
  }
}
