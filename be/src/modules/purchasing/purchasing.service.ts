import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { ClientSession, Connection, Model, Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { GlobalService } from 'src/global/global.service';
import { ApprovalType, FlowType, IListRes, OrderType } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { Purchasing, PurchasingEn } from './purchasing.schema';
import { ListPurchasingItemsDTO, PurchaseOrderApprovalDto, PurchaseOrderDto, PurchasingDetail, PurchasingDto } from './purchasing.dto';
import { Supplier } from '../supplier/supplier.schema';
import { InventoryService } from '../inventory/inventory.service';
import { PurchasingItem } from '../purchasing-item/purchasing-item.schema';
import { PurchasingItemService } from '../purchasing-item/purchasing-item.service';
import { PurchasingItemDto, ReceiveOrderItemDto } from '../purchasing-item/purchasing-item.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { decreaseDays } from 'src/utils/helper';
import { cleanupDays } from 'src/types/constants';
import { Document } from 'mongoose';
import { Accounting } from '../accounting/accounting.schema';
import { AccountingService } from '../accounting/accounting.service';

@Injectable()
export class PurchasingService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @Inject(forwardRef(() => AccountingService))
    private accounting: AccountingService,
    @Inject(forwardRef(() => InventoryService))
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
    }], { session });

    const createdPurchase = purchase[0];

    await createdPurchase.save({ session });
    await session.commitTransaction();
    await session.endSession();
    return await this.detailPurchasing(createdPurchase._id);
  }

  async editPurchasing(id: Types.ObjectId, data: PurchasingDto & { status?: PurchasingEn }, sessionIn?: ClientSession): Promise<{ detail: PurchasingDetail; removedAttachments: string[] }> {
    return this.global.withTransaction(async (session) => {
      const purchase = await this.purchasingModel.findById(id).session(session);
      if (!purchase) throw BaseResponse.notFound({ err: 'Purchasing not found' });

      const supplier = await this.supplierModel.findById(data.supplier).session(session);
      if (!supplier) throw BaseResponse.notFound({ err: 'Supplier not found' });

      const allowedFieldsByStatus = {
        [PurchasingEn.EXPIRED]: [''],
        [PurchasingEn.DROP]: [''],
        [PurchasingEn.COMPLETE]: [''],
        [PurchasingEn.RECEIVE]: ['status', 'notes', 'completed_date'],
        [PurchasingEn.PROCESS]: ['status', 'invoice_number', 'purchasing_attachments', 'additional_cost', 'notes'],
        [PurchasingEn.REJECT]: ['status', 'purchasing_attachments', 'due_date', 'supplier_name', 'supplier', 'additional_cost', 'notes'],
        [PurchasingEn.APPROVE]: ['status', 'purchasing_attachments', 'due_date', 'additional_cost', 'notes'],
        [PurchasingEn.REQUEST]: ['status', 'reject_notes'],
        [PurchasingEn.CREATE]: ['status', 'purchasing_attachments', 'due_date', 'supplier_name', 'supplier', 'additional_cost', 'notes'],
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

      const oldAttachments = purchase.purchasing_attachments ?? [];
      const newAttachments = data.purchasing_attachments ?? oldAttachments;

      const removedAttachments = oldAttachments.filter(
        (url) => !newAttachments.includes(url),
      );

      fields.forEach((field: string) => {
        if (field === 'supplier') purchase.supplier = supplier._id;
        if (field === 'supplier_name') purchase.supplier_name = supplier.supplier_name;
        if (field === 'due_date') purchase.due_date = data.due_date;
        if (field === 'invoice_number') purchase.invoice_number = data.invoice_number;
        if (field === 'purchasing_attachments') purchase.purchasing_attachments = data.purchasing_attachments;
        if (field === 'additional_cost') purchase.additional_cost = data.additional_cost;
        if (field === 'reject_notes') purchase.reject_notes = data.reject_notes;
        if (field === 'status') purchase.status = data.status ?? purchase.status;
      });

      await purchase.save({ session });
      const detail = await this.detailPurchasing(purchase._id);

      return {
        detail,
        removedAttachments,
      };
    }, sessionIn);
  }

  async listPurchasing({
    page,
    size,
    sortBy,
    sortDir,
    search,
    filter
  }: PaginationDto): Promise<IListRes<Purchasing>> {
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

  async detailPurchasing(purchasing_id: Types.ObjectId): Promise<PurchasingDetail> {
    const detailPurchasing = await this.purchasingModel
      .findById(purchasing_id)
      .populate('supplier')
      .lean(); // <-- important

    if (!detailPurchasing) throw BaseResponse.notFound();
    const total_purchase_price = await this.countTotalPurchasePrice(purchasing_id);

    return {
      ...detailPurchasing,
      total_purchase_price,
    };
  }

  async countTotalPurchasePrice(purchasing_id: Types.ObjectId): Promise<mongoose.Schema.Types.Decimal128> {
    const result = await this.purchasingItemModel.aggregate([
      {
        $match: { purchasing_id },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: ["$purchase_price", "$purchase_qty"],
            },
          },
        },
      },
    ]);

    return result[0]?.total ?? 0;
  }

  async listPurchasingItems({
    purchasing_id,
    page,
    size,
    sortBy,
    sortDir,
    search,
  }: ListPurchasingItemsDTO): Promise<IListRes<PurchasingItem>> {
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

  async deletePurchasing(id: Types.ObjectId, sessionIn?: ClientSession): Promise<{ detail: Purchasing | undefined; removedAttachments: string[] }> {
    return this.global.withTransaction(async (session) => {
      const purchasing = await this.purchasingModel.findById(id).session(session);
      if (!purchasing) throw BaseResponse.notFound({ err: 'deletePurchasing !purchasing', option: { message: 'Purchasing not found' } });
      const allowedStatus = [PurchasingEn.CREATE, PurchasingEn.REQUEST, PurchasingEn.REJECT, PurchasingEn.EXPIRED];
      if (!allowedStatus.includes(purchasing.status)) {
        BaseResponse.forbidden({ err: 'deletePurchasing !allowedStatus', option: { message: `Cannot delete item with status ${purchasing.status}` } });
      }
      const removedAttachments = purchasing.purchasing_attachments ?? [];

      await this.global.deleteData(purchasing, session);
      const items = await this.purchasingItemModel.find({ purchase_order: id }).session(session);
      await Promise.all(items.map(async item => {
        await this.global.deleteData(item, session);
      }))

      const detail = await this.detailPurchasing(purchasing._id);
      return {
        detail,
        removedAttachments,
      };
    }, sessionIn);
  }

  async bulkUpdatePurchasingItems(purchasing_id: Types.ObjectId, data: PurchasingItemDto[], sessionIn?: ClientSession): Promise<PurchasingItem[]> {
    return this.global.withTransaction(async (session) => {
      const existingItems = await this.purchasingItemModel.find({
        purchase_order: purchasing_id,
      }).session(session);
      const itemMap = new Map( //make list of item with product id as key
        existingItems.map(i => [i.product.toString(), i]),
      );

      // First filter: Delete purchasing items that is not listed in the payload of list items
      // (when user not includes the item in the payload list, it means user intends to remove it)
      const dtoProductIds = data.map(it => it.product);
      const toDelete = existingItems.filter(
        i => !dtoProductIds.includes(i.product)
      );
      await this.purchasingItemModel.deleteMany({
        _id: { $in: toDelete.map(i => i._id) },
      }).session(session);

      // The rest: if any item in the payload list is already available in DB, it means user intends to change it's value
      await Promise.all(data.map(async item => {
        const existing = itemMap.get(item.product.toString());
        const newData = { ...item, purchase_order: purchasing_id };
        if (existing) {
          await this.purchaseItemSvc.editPurchasingItem(existing._id, newData, session);
        } else {
          await this.purchaseItemSvc.createPurchasingItem(newData, session);
        }
      }));

      const list = await this.listPurchasingItems({ purchasing_id });
      return list.data;
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
      return await this.detailPurchasing(purchase._id);
    }, sessionIn);
  }

  async purchaseOrder(id: Types.ObjectId): Promise<Purchasing | undefined> {
    return this.global.withTransaction(async (session) => {
      return await this.purchasingUpdateStat(id, PurchasingEn.REQUEST, undefined, session)
    });
  }

  async purchasingApproval(id: Types.ObjectId, dto: PurchaseOrderApprovalDto, sessionIn?: ClientSession): Promise<Purchasing | undefined> {
    return this.global.withTransaction(async (session) => {
      if (dto.approval === ApprovalType.APPROVE) {
        return await this.purchasingUpdateStat(id, PurchasingEn.APPROVE, undefined, session)
      } else {
        return await this.purchasingUpdateStat(id, PurchasingEn.REJECT, dto.reject_notes, session)
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

  async purchasingPayment(id: Types.ObjectId, dto: PurchaseOrderDto, sessionIn?: ClientSession): Promise<{ detail: Purchasing | undefined; removedAttachments: string[] }> {
    return this.global.withTransaction(async (session) => {
      const edit = await this.editPurchasing(id, dto, session);
      if (!edit || !edit.detail) throw BaseResponse.unexpected({ err: 'purchasingPayment' });
      const accountingPayload: Accounting = {
        flow_type: FlowType.OUT,
        order_id: edit.detail?._id,
        order_data: edit.detail,
        order_type: OrderType.PURCHASING,
        transaction_amount: edit.detail?.total_purchase_price
      }
      await this.accounting.createAccountingItem(accountingPayload, session)
      return edit;
    }, sessionIn)
  }

  async receiveOrder(id: Types.ObjectId, dto: PurchaseOrderDto, updateItems: ReceiveOrderItemDto[]): Promise<{ detail: Purchasing | undefined; removedAttachments: string[] }> {
    return this.global.withTransaction(async (session) => {
      const purchase = await this.purchasingModel.findById(id).session(session);
      if (!purchase)
        throw BaseResponse.notFound({ err: { text: 'receiveOrder purchase not found' } });
      if (purchase.status !== PurchasingEn.PROCESS)
        throw BaseResponse.forbidden({ err: { text: 'receiveOrder invalid status' } });

      let completed = 0;
      // Update value received_qty for each item
      await Promise.all(
        updateItems.map(async item => {
          const existing = await this.purchasingItemModel
            .findById(item._id)
            .session(session);
          if (!existing) throw BaseResponse.notFound({ err: 'receiveOrder !existing' });
          const newReceived = existing.received_qty + (item.received_qty ?? 0);
          if (newReceived > existing.purchase_qty) {
            throw BaseResponse.invalid({
              err: 'Received qty exceeds purchase qty'
            });
          }
          existing.received_qty = newReceived;
          if (existing.purchase_qty === existing.received_qty) completed += 1;
          await existing.save({ session });
        })
      );
      const totalItems = await this.purchasingItemModel.countDocuments({ purchase_order: id });
      const body = {
        ...dto,
        status: totalItems === completed ? PurchasingEn.COMPLETE : PurchasingEn.RECEIVE,
        completed_date: completed ? new Date() : undefined
      }
      const updatedPurchase = await this.editPurchasing(id, body, session);
      if (!updatedPurchase) throw BaseResponse.unexpected({ err: { text: 'receiveOrder failed to editPurchasing' } });
      return updatedPurchase;
    });
  }
}
