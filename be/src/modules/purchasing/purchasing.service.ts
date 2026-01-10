import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { GlobalService } from 'src/global/global.service';
import { IPaginationRes } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { Purchasing, PurchasingEn } from './purchasing.schema';
import { ListPurchasingItemsDTO, PurchasingDto, ReceiveOrderDto } from './purchasing.dto';
import { Supplier } from '../supplier/supplier.schema';
import { InventoryService } from '../inventory/inventory.service';
import { PurchasingItem } from '../purchasing-item/purchasing-item.schema';
import { PurchasingItemService } from '../purchasing-item/purchasing-item.service';
import { PurchasingItemDto } from '../purchasing-item/purchasing-item.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { decreaseDays } from 'src/utils/helper';
import { cleanupDays } from 'src/types/constants';
import * as fs from 'fs';

@Injectable()
export class PurchasingService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    private inventory: InventoryService,
    private purchaseItemSvc: PurchasingItemService,
    @InjectModel(Purchasing.name) private purchasingModel: Model<Purchasing>,
    @InjectModel(PurchasingItem.name) private purchasingItemModel: Model<PurchasingItem>,
    @InjectModel(Supplier.name) private supplierModel: Model<Supplier>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  private readonly logger = new Logger(PurchasingService.name);

  // Run every hour
  @Cron(CronExpression.EVERY_HOUR)
  async cleanup() {
    await this.expirePurchases();
    await this.deletePurchases();
  }

  async expirePurchases() {
    const now = new Date();
    await this.purchasingModel.updateMany(
      {
        due_date: { $lt: now },
        status: { $nin: [PurchasingEn.PROCESS, PurchasingEn.RECEIVE, PurchasingEn.DROP] },
      },
      { $set: { status: PurchasingEn.EXPIRED } },
    );
  }

  async deletePurchases() {
    const now = new Date();
    const expired = await this.purchasingModel.find(
      {
        due_date: { $lt: decreaseDays(now, cleanupDays) },
        status: { $in: [PurchasingEn.EXPIRED] },
      },
    ).lean();
    const dropped = await this.purchasingModel.find(
      {
        updatedAt: { $lt: decreaseDays(now, cleanupDays) }, //WARNING: this must be the date when status changed to DROP
        status: { $in: [PurchasingEn.DROP] },
      },
    ).lean();
    const purchasings = expired.concat(dropped);
    await Promise.all(purchasings.map(async item => {
      const deleted = await this.deletePurchasing(item._id)
      if (deleted) this.logger.log(`Purchasing deleted, id: ${item._id.toString()}`);
    }));
  }

  async createPurchasing(data: PurchasingDto & { status: PurchasingEn }): Promise<Purchasing | undefined> {
    const session = await this.connection.startSession();
    session.startTransaction();

    const supplier = await this.supplierModel.findById(data.supplier).session(session);
    if (!supplier) {
      await session.abortTransaction();
      throw BaseResponse.notFound({ err: 'Supplier not found' });
    }
    const purchase = await this.purchasingModel.create([{  // use array + session
      ...data,
      supplier: supplier._id,
      supplier_name: supplier.supplier_name,
      due_date: data.due_date,
      status: data.status,
      total_purchase_price: 0,
    }], { session });

    const createdPurchase = purchase[0];

    await createdPurchase.save({ session });
    await session.commitTransaction();
    await session.endSession();
    return this.detailPurchasing(createdPurchase._id);
  }

  async editPurchasing(id: Types.ObjectId, data: PurchasingDto & { status?: PurchasingEn }, sessionIn?: ClientSession): Promise<Purchasing | undefined> {
    return this.global.withTransaction(async (session) => {
      const purchase = await this.purchasingModel.findById(id).session(session);
      if (!purchase) throw BaseResponse.notFound({ err: 'Purchasing not found' });

      const supplier = await this.supplierModel.findById(data.supplier).session(session);
      if (!supplier) throw BaseResponse.notFound({ err: 'Supplier not found' });

      const allowedFieldsByStatus = {
        [PurchasingEn.EXPIRED]: [''],
        [PurchasingEn.DROP]: [''],
        [PurchasingEn.RECEIVE]: ['status'],
        [PurchasingEn.PROCESS]: ['status', 'invoice_number', 'invoice_photo', 'due_date', 'additional_cost'],
        [PurchasingEn.REJECT]: [''],
        [PurchasingEn.APPROVE]: ['status', 'invoice_number', 'invoice_photo', 'due_date', 'additional_cost'],
        [PurchasingEn.REQUEST]: ['status', 'reject_notes'],
        [PurchasingEn.CREATE]: ['status', 'invoice_number', 'invoice_photo', 'due_date', 'total_purchase_price', 'supplier_name', 'supplier', 'additional_cost'],
      };
      // get allowed fields for this status
      const fields: string[] = purchase.status ? allowedFieldsByStatus[purchase.status] : [];
      // find invalid keys
      const invalidKeys = Object.keys(data).filter(
        key => !fields.includes(key)
      );

      if (invalidKeys.length) {
        throw BaseResponse.invalid({
          err: `editPurchasing Invalid fields for status ${purchase.status}: ${invalidKeys.join(', ')}`,
          option: { message: `Not allowed to update these fields: ${invalidKeys.join(', ')} \n For purchasing with status: ${purchase.status}` }
        });
      }

      if (purchase.invoice_photo && purchase.invoice_photo !== data.invoice_photo) {
        try {
          const oldPath = new URL(purchase.invoice_photo).pathname; // e.g. /uploads/invoices/<uuid>/<file>
          const folderPath = oldPath.split('/').slice(0, -1).join('/'); // remove file name
          fs.rmSync(`.${folderPath}`, { recursive: true, force: true }); // delete the folder
        } catch (err) {
          console.warn('Failed to delete old invoice folder:', err.message);
        }
      }

      fields.forEach((field: string) => {
        if (field === 'supplier') purchase.supplier = supplier._id;
        if (field === 'supplier_name') purchase.supplier_name = supplier.supplier_name;
        if (field === 'due_date') purchase.due_date = data.due_date;
        if (field === 'invoice_number') purchase.invoice_number = data.invoice_number;
        if (field === 'invoice_photo') purchase.invoice_photo = data.invoice_photo;
        if (field === 'additional_cost') purchase.additional_cost = data.additional_cost;
        if (field === 'reject_notes') purchase.reject_notes = data.reject_notes;
        if (field === 'status') purchase.status = data.status ?? purchase.status;
      });

      await purchase.save({ session });
      return this.detailPurchasing(purchase._id);
    }, sessionIn);
  }

  async listPurchasing({
    page,
    size,
    sortBy,
    sortDir,
    search,
    filter
  }: PaginationDto): Promise<{ data: Purchasing[]; meta: IPaginationRes }> {
    const searchFields: string[] = ['supplier_name'];

    return this.global.getList<Purchasing>(
      this.purchasingModel,
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

  async detailPurchasing(purchasing_id: Types.ObjectId): Promise<Purchasing | undefined> {
    const detailPurchasing = await this.purchasingModel
      .findById(purchasing_id)
      .populate('supplier')
      .lean()
      .exec();
    return detailPurchasing || undefined;
  }

  async listPurchasingItems({
    purchasing_id,
    page,
    size,
    sortBy,
    sortDir,
    search,
  }: ListPurchasingItemsDTO): Promise<{ data: PurchasingItem[]; meta: IPaginationRes }> {
    const searchFields: string[] = ['product_name'];
    const filter: { column: string, value: any } = { column: 'purchase_order', value: purchasing_id }

    return this.global.getList<PurchasingItem>(
      this.purchasingItemModel,
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

  async deletePurchasing(id: Types.ObjectId, sessionIn?: ClientSession): Promise<Purchasing | undefined> {
    return this.global.withTransaction(async (session) => {
      const purchasing = await this.purchasingModel.findById(id).session(session);
      if (!purchasing) throw BaseResponse.notFound({ err: 'deletePurchasing failed', option: { message: 'Purchasing not found' } });
      if (purchasing.invoice_photo) {
        try {
          const oldPath = new URL(purchasing.invoice_photo).pathname; // e.g. /uploads/invoices/<uuid>/<file>
          const folderPath = oldPath.split('/').slice(0, -1).join('/'); // remove file name
          fs.rmSync(`.${folderPath}`, { recursive: true, force: true }); // delete the folder
        } catch (err) {
          console.warn('deletePurchasing Failed to delete old invoice folder:', err.message);
        }
      }
      const deleted = await this.global.deleteData(purchasing, session);
      const items = await this.purchasingItemModel.find({ purchase_order: id }).session(session);
      await Promise.all(items.map(async item => {
        await this.global.deleteData(item, session);
      }))
      return deleted || undefined;
    }, sessionIn);
  }

  async bulkUpdatePurchasingItems(purchasing_id: Types.ObjectId, data: PurchasingItemDto[], sessionIn?: ClientSession): Promise<Array<PurchasingItem & { _id: Types.ObjectId }>> {
    return this.global.withTransaction(async (session) => {
      const existingItems = await this.purchasingItemModel.find({
        purchase_order: purchasing_id,
      }).session(session);

      const dtoProductIds = data.map(it => it.product);

      const toDelete = existingItems.filter(
        i => !dtoProductIds.includes(i.product)
      );
      await this.purchasingItemModel.deleteMany({
        _id: { $in: toDelete.map(i => i._id) },
      }).session(session);

      await Promise.all(data.map(async item => {
        const existing = existingItems.find(i => i.product.toString() === item.product.toString());
        const newData = { ...item, purchase_order: purchasing_id };
        if (existing) {
          await this.purchaseItemSvc.editPurchasingItem(existing._id, newData, session);
        } else {
          await this.purchaseItemSvc.createPurchasingItem(newData, session);
        }
      }));

      const list = await this.purchasingItemModel.find({ purchase_order: purchasing_id }).session(session).lean();
      return list;
    }, sessionIn);
  }

  async purchasingUpdateStat(id: Types.ObjectId, status: PurchasingEn, notes?: string, sessionIn?: ClientSession): Promise<Purchasing | undefined> {
    return this.global.withTransaction(async (session) => {
      const purchase = await this.purchasingModel.findById(id).session(session);
      if (!purchase) {
        throw BaseResponse.notFound({ err: { text: 'purchaseOrder purchase not found' } });
      }
      purchase.status = status;
      if (status === PurchasingEn.REJECT) purchase.reject_notes = notes;
      if (status === PurchasingEn.APPROVE) purchase.reject_notes = undefined;
      await purchase.save({ session });
      return purchase;
    }, sessionIn);
  }

  async purchaseOrder(id: Types.ObjectId): Promise<Purchasing | undefined> {
    return this.global.withTransaction(async (session) => {
      return await this.purchasingUpdateStat(id, PurchasingEn.REQUEST, undefined, session)
    });
  }

  async purchasingApproval(id: Types.ObjectId, status: PurchasingEn, notes?: string, sessionIn?: ClientSession): Promise<Purchasing | undefined> {
    return this.global.withTransaction(async (session) => {
      if (status === PurchasingEn.APPROVE) {
        return await this.purchasingUpdateStat(id, status, undefined, session)
      } else {
        return await this.purchasingUpdateStat(id, status, notes, session)
      }
    }, sessionIn)
  }

  async purchasingExecute(id: Types.ObjectId, sessionIn?: ClientSession): Promise<Purchasing | undefined> {
    return this.global.withTransaction(async (session) => {
      return await this.purchasingUpdateStat(id, PurchasingEn.PROCESS, undefined, session);
    }, sessionIn)
  }

  async purchasingDrop(id: Types.ObjectId, notes?: string, sessionIn?: ClientSession): Promise<Purchasing | undefined> {
    return this.global.withTransaction(async (session) => {
      return await this.purchasingUpdateStat(id, PurchasingEn.DROP, notes, session);
    }, sessionIn)
  }

  async receiveOrder(id: Types.ObjectId, dto: ReceiveOrderDto, updateItems: PurchasingItemDto[]): Promise<Purchasing | undefined> {
    return this.global.withTransaction(async (session) => {
      const purchase = await this.purchasingModel.findById(id).session(session);
      if (!purchase)
        throw BaseResponse.notFound({ err: { text: 'receiveOrder purchase not found' } });
      if (purchase.status !== PurchasingEn.PROCESS)
        throw BaseResponse.forbidden({ err: { text: 'receiveOrder invalid status' } });
      // ✅ Step 1: Update purchasing and its items
      const updatedPurchase = await this.editPurchasing(id, {
        ...dto,
      }, session);
      if (!updatedPurchase)
        throw BaseResponse.unexpected({ err: { text: 'receiveOrder failed to editPurchasing' } });
      // ✅ Step 2: Update items with new values (optional)
      const updatedItems = await this.bulkUpdatePurchasingItems(id, updateItems, session);
      // ✅ Step 3: Safely loop and create inventory
      await Promise.all(updatedItems.map(async item => {
        await this.inventory.createInventory({ purchase_item: item._id }, session);
      }))
      return updatedPurchase;
    });
  }
}
