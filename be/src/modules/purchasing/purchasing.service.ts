import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Document, Model, Types } from 'mongoose';
import { PaginationDto } from 'src/global/global.dto';
import { GlobalService } from 'src/global/global.service';
import { ApprovalType, FlowType, IListRes, OrderType, PPnType } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { PaymentStatusEn, Purchasing, PurchasingEn, ValidatePaymentInput, ValidatePaymentResult } from './purchasing.schema';
import { PurchaseOrderApprovalDto, PurchaseOrderDto, PurchasingDetail, PurchasingDto } from './purchasing.dto';
import { Supplier } from '../supplier/supplier.schema';
import { PurchasingItem } from '../purchasing-item/purchasing-item.schema';
import { PurchasingItemService } from '../purchasing-item/purchasing-item.service';
import { PurchasingItemDto, ReceiveOrderItemDto } from '../purchasing-item/purchasing-item.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { decreaseDays, digitShortDate, multiplyDecimal, toDecimal, toDecimal128 } from 'src/utils/helper';
import { cleanupDays } from 'src/types/constants';
import { Accounting } from '../accounting/accounting.schema';
import { AccountingService } from '../accounting/accounting.service';
import { InventoryMovementService } from '../inventory-movement/inventory-movement.service';
import { InventoryMovementDto } from '../inventory-movement/inventory-movement.dto';
import Decimal from 'decimal.js';

@Injectable()
export class PurchasingService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @Inject(forwardRef(() => AccountingService))
    private accounting: AccountingService,
    @Inject(forwardRef(() => InventoryMovementService))
    private inventoryMovementSvc: InventoryMovementService,
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
      try {
        const deleted = await this.deletePurchasing(item._id as any);
        if (deleted) this.logger.log(`Purchasing deleted, id: ${item._id.toString()}`);
      } catch (err) {
        this.logger.error(`Failed to delete purchasing ${item._id.toString()}`, err);
      }
    }));
  }

  async createPurchasing(data: PurchasingDto): Promise<Purchasing | undefined> {
    const session = await this.connection.startSession();
    session.startTransaction();

    const supplier = await this.supplierModel.findById(data.supplier).session(session);
    if (!supplier) {
      await session.abortTransaction();
      throw BaseResponse.notFound({ err: 'Supplier not found' });
    }
    const purchase = await this.purchasingModel.create([{  // use array + session
      supplier: supplier._id,
      supplier_name: supplier.supplier_name,
      due_date: data.due_date,
      status: PurchasingEn.CREATE,
      purchasing_attachments: data.purchasing_attachments,
      notes: data.notes,
    }], { session });

    const createdPurchase = purchase[0];

    await session.commitTransaction();
    await session.endSession();
    return await this.detailPurchasing(createdPurchase._id);
  }

  async editPurchasing(id: Types.ObjectId, data: PurchasingDto & { reject_notes?: string, completed_date?: Date }, sessionIn?: ClientSession): Promise<{ detail: PurchasingDetail; removedAttachments: string[] }> {
    return this.global.withTransaction(async (session) => {
      const purchase = await this.purchasingModel.findById(id).session(session);
      if (!purchase) throw BaseResponse.notFound({ err: 'Purchasing not found' });

      const allowedFieldsByStatus = {
        [PurchasingEn.EXPIRED]: [''],
        [PurchasingEn.DROP]: [''],
        [PurchasingEn.COMPLETE]: [
          'status',
          'payment_status',
          'invoice_number',
          'ppn_facture_number',
          'purchasing_attachments',
          'notes',
          'completed_date',
          'payment_status',
          'paid_total'
        ],
        [PurchasingEn.RECEIVE]: [
          'status',
          'payment_status',
          'invoice_number',
          'ppn_facture_number',
          'purchasing_attachments',
          'notes',
          'completed_date',
          'payment_status',
          'paid_total'
        ],
        [PurchasingEn.PROCESS]: [
          'status',
          'payment_status',
          'notes',
          'invoice_number',
          'ppn_facture_number',
          'purchasing_attachments',
          'payment_realization',
          'ppn_type',
          'ppn_rate',
          'ppn_amount',
          'shipping_cost',
          'paid_total'
        ],
        [PurchasingEn.REJECT]: [
          'supplier',
          'due_date',
          'status',
          'payment_status',
          'notes',
          'invoice_number',
          'ppn_facture_number',
          'purchasing_attachments',
          'payment_realization',
          'ppn_type',
          'ppn_rate',
          'ppn_amount',
          'shipping_cost',
          'paid_total'
        ],
        [PurchasingEn.APPROVE]: [
          'due_date',
          'status',
          'payment_status',
          'payment_status',
          'notes',
          'invoice_number',
          'ppn_facture_number',
          'purchasing_attachments',
          'payment_realization',
          'ppn_type',
          'ppn_rate',
          'ppn_amount',
          'shipping_cost',
          'paid_total'
        ],
        [PurchasingEn.REQUEST]: [
          'status',
          'payment_status',
          'reject_notes',
        ],
        [PurchasingEn.CREATE]: [
          'supplier',
          'due_date',
          'status',
          'payment_status',
          'notes',
          'invoice_number',
          'ppn_facture_number',
          'purchasing_attachments',
          'payment_realization',
          'ppn_type',
          'ppn_rate',
          'ppn_amount',
          'shipping_cost',
          'paid_total'
        ],
      };
      // get allowed fields for this status
      const fields: string[] = purchase.status ? allowedFieldsByStatus[purchase.status] : [];
      // find invalid keys
      const invalidKeys = Object.keys(data).filter(
        key => !fields.includes(key) && data[key] !== undefined && data[key] !== null && data[key] !== 'null' && data[key] !== 'undefined' && data[key] !== ''
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

      const paymentDataFields: Array<keyof PurchaseOrderDto> = [
        'payment_realization',
        'ppn_type',
        'ppn_rate',
        'ppn_amount',
        'shipping_cost',
      ];
      const attemptingPaymentDataUpdate = paymentDataFields.some((field) => (data as any)[field] !== undefined);
      if (purchase.payment_status !== PaymentStatusEn.UNPAID && attemptingPaymentDataUpdate) {
        throw BaseResponse.invalid({
          option: { message: 'Payment data is locked once payment status is PARTIAL or PAID' }
        });
      }


      if (data.supplier) {
        const found = await this.supplierModel.findById(data.supplier).session(session);
        if (!found) throw BaseResponse.notFound({ err: 'Supplier not found' });
        purchase.supplier = data.supplier;
        purchase.supplier_name = found.supplier_name;
      }
      if (data.due_date !== undefined && fields.includes('due_date')) purchase.due_date = data.due_date;
      if (data.invoice_number !== undefined && fields.includes('invoice_number')) purchase.invoice_number = data.invoice_number;
      if (data.ppn_facture_number !== undefined && fields.includes('ppn_facture_number')) purchase.ppn_facture_number = data.ppn_facture_number;
      if (data.purchasing_attachments !== undefined && fields.includes('purchasing_attachments')) purchase.purchasing_attachments = newAttachments;
      if (data.payment_realization !== undefined && fields.includes('payment_realization')) purchase.payment_realization = toDecimal128(toDecimal(data.payment_realization));
      if (data.ppn_type !== undefined && fields.includes('ppn_type')) purchase.ppn_type = data.ppn_type;
      if (data.ppn_amount !== undefined && fields.includes('ppn_amount')) purchase.ppn_amount = toDecimal128(toDecimal(data.ppn_amount));
      if (data.shipping_cost !== undefined && fields.includes('shipping_cost')) purchase.shipping_cost = toDecimal128(toDecimal(data.shipping_cost));
      if (data.payment_status !== undefined && fields.includes('payment_status')) purchase.payment_status = data.payment_status;
      if (data.notes !== undefined && fields.includes('notes')) purchase.notes = data.notes;
      if (data.paid_total !== undefined && fields.includes('paid_total')) purchase.paid_total = toDecimal128(toDecimal(data.paid_total));
      if (data.completed_date !== undefined && fields.includes('completed_date')) purchase.completed_date = data.completed_date;
      if (data.reject_notes !== undefined && fields.includes('reject_notes')) purchase.reject_notes = data.reject_notes;

      await purchase.save({ session });
      const detail = await this.detailPurchasing(purchase._id);

      // ─── Sync with Accounting ─────────────────────────────────────────────
      const hasAccounting = await this.accounting.existsByOrderId(purchase._id);
      if (hasAccounting) {
        await this.accounting.editAccountingByOrderId(
          purchase._id as any,
          {
            transaction_amount: detail.payment_realization,
            tax_base: detail.total_purchase_price,
            ppn_type: detail.ppn_type as any,
            ppn_rate: detail.ppn_rate,
            ppn_amount: detail.ppn_amount,
            tax_facture_number: detail.ppn_facture_number,
            order_data: detail,
            record_date: new Date(),
          },
          session
        );
      }

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
    filter,
    start_date,
    end_date
  }: PaginationDto): Promise<IListRes<Purchasing>> {
    const searchFields: string[] = ['supplier_name'];

    const customConditions: any = {};
    if (start_date && end_date) {
      customConditions.createdAt = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      };
    }

    const list = await this.global.getList<Purchasing>(
      this.purchasingModel,
      {
        page,
        size,
        sortBy,
        sortDir,
        search,
        searchFields,
        filter,
        customConditions
      }
    )
    return {
      meta: list.meta,
      data: await Promise.all(list.data.map(async it => {
        const obj = it.toObject();
        return {
          ...obj,
          total_purchase_price: await this.countTotalPurchasePrice(obj._id)
        };
      }))
    };
  }

  async detailPurchasing(purchasing_id: Types.ObjectId): Promise<PurchasingDetail> {
    const detailPurchasing = await this.purchasingModel
      .findById(purchasing_id)
      .populate('supplier')
      .lean(); // <-- important

    if (!detailPurchasing) throw BaseResponse.notFound();
    const total_purchase_price = await this.countTotalPurchasePrice(purchasing_id);
    const validation = this.validatePayment({
      total_price: total_purchase_price,
      ppn_type: detailPurchasing.ppn_type ?? PPnType.NONE,
      ppn_rate: detailPurchasing.ppn_rate ?? 0,
      ppn_amount: detailPurchasing.ppn_amount ?? toDecimal128(toDecimal(0)),
      payment_realization: detailPurchasing.payment_realization ?? toDecimal128(toDecimal(0)),
      shipping_cost: detailPurchasing.shipping_cost ?? toDecimal128(toDecimal(0)),
    });

    return {
      ...detailPurchasing,
      total_purchase_price,
      validation,
      predicted_additional_cost: validation.predicted_additional_cost,
    };
  }

  async countTotalPurchasePrice(purchasing_id: Types.ObjectId): Promise<Types.Decimal128> {
    const result = await this.purchasingItemModel.aggregate([
      {
        $match: { purchase_order: new Types.ObjectId(purchasing_id) }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: [
                { $toDecimal: "$purchase_price" },
                { $toDecimal: "$purchase_qty" }
              ],
            },
          },
        },
      },
    ]);

    return toDecimal128(toDecimal(result[0]?.total ?? 0));
  }

  async listPurchasingItems(purchasing_id: Types.ObjectId, pagination?: PaginationDto): Promise<IListRes<PurchasingItem & { price_total: Types.Decimal128 }>> {

    const searchFields = ['product_name'];

    const filter = {
      column: 'purchase_order',
      value: purchasing_id
    };

    const list = await this.global.getList<PurchasingItem>(
      this.purchasingItemModel,
      {
        page: pagination?.page,
        size: pagination?.size,
        sortBy: pagination?.sortBy,
        sortDir: pagination?.sortDir,
        search: pagination?.search,
        searchFields,
        filter
      }
    );

    return {
      meta: list.meta,
      data: list.data.map(it => {
        const obj = it.toObject();

        return {
          ...obj,
          price_total: multiplyDecimal(obj.purchase_price, obj.purchase_qty)
        };
      })
    };
  }

  async deletePurchasing(id: Types.ObjectId, sessionIn?: ClientSession): Promise<{ detail: Purchasing | undefined; removedAttachments: string[] }> {
    return this.global.withTransaction(async (session) => {
      const purchasing = await this.purchasingModel.findById(id).session(session);
      if (!purchasing) throw BaseResponse.notFound({ err: 'deletePurchasing !purchasing', option: { message: 'Purchasing not found' } });
      const allowedStatus = [PurchasingEn.CREATE, PurchasingEn.REQUEST, PurchasingEn.REJECT, PurchasingEn.EXPIRED];
      if (!allowedStatus.includes(purchasing.status)) {
        throw BaseResponse.forbidden({ err: 'deletePurchasing !allowedStatus', option: { message: `Cannot delete item with status ${purchasing.status}` } });
      }
      const removedAttachments = purchasing.purchasing_attachments ?? [];

      await this.global.deleteData(purchasing, session);
      const items = await this.purchasingItemModel.find({ purchase_order: id }).session(session);
      await Promise.all(items.map(async item => {
        await this.global.deleteData(item, session);
      }))
      return {
        detail: purchasing,
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
      const dtoProductIds = new Set(data.map(it => it.product.toString()));
      const toDelete = existingItems.filter(
        i => !dtoProductIds.has(i.product.toString())
      );
      await this.purchasingItemModel.deleteMany({
        _id: { $in: toDelete.map(i => i._id) },
      }).session(session);

      // The rest: if any item in the payload list is already available in DB, it means user intends to change it's value
      await Promise.all(data.map(async item => {
        const existing = itemMap.get(item.product.toString());
        const newData = { ...item, purchase_order: purchasing_id.toString() };
        if (existing) {
          await this.purchaseItemSvc.editPurchasingItem(existing._id, newData, session);
        } else {
          await this.purchaseItemSvc.createPurchasingItem(newData, session);
        }
      }));

      const list = await this.listPurchasingItems(purchasing_id);
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

  validatePayment(
    input: ValidatePaymentInput,
  ): ValidatePaymentResult {
    const totalPrice = toDecimal(input.total_price);
    const shipping = toDecimal(input.shipping_cost);
    const ppnRate = new Decimal(input.ppn_rate).div(100);
    let expectedPpn = new Decimal(0);
    if (input.ppn_type === PPnType.EXCLUSIVE) {
      expectedPpn = totalPrice.mul(ppnRate);
    }
    if (input.ppn_type === PPnType.INCLUSIVE) {
      const base = totalPrice.div(new Decimal(1).plus(ppnRate));
      expectedPpn = totalPrice.minus(base);
    }
    expectedPpn = expectedPpn.toDP(2);
    const expectedPayable = this.computeExpectedPayable(totalPrice, input.ppn_type, input.ppn_rate, shipping);
    // =====================
    // 3️⃣ Predicted Additional Cost
    // =====================
    const payment = toDecimal(input.payment_realization);
    const predictedAdditionalCost =
      payment.minus(expectedPayable).toDP(2);
    // =====================
    // 5️⃣ Validation Flags
    // =====================
    const providedPpn = toDecimal(input.ppn_amount);

    const isPpnValid = expectedPpn.equals(providedPpn.toDP(2));

    const isPaymentMatch = payment.greaterThanOrEqualTo(expectedPayable);

    return {
      expected_ppn_amount: toDecimal128(expectedPpn),
      expected_payable: toDecimal128(expectedPayable),
      predicted_additional_cost: toDecimal128(predictedAdditionalCost),
      is_ppn_valid: isPpnValid,
      is_payment_match: isPaymentMatch,
    };
  }

  private computeExpectedPayable(
    taxBase: Decimal,
    ppnType: PPnType,
    ppnRateRaw: number,
    shipping: Decimal,
  ): Decimal {
    const ppnRate = new Decimal(ppnRateRaw || 0).div(100);
    const expectedPpn = ppnType === PPnType.EXCLUSIVE
      ? taxBase.mul(ppnRate)
      : ppnType === PPnType.INCLUSIVE
        ? taxBase.minus(taxBase.div(new Decimal(1).plus(ppnRate)))
        : new Decimal(0);

    return (ppnType === PPnType.INCLUSIVE
      ? taxBase.plus(shipping)
      : taxBase.plus(shipping).plus(expectedPpn)).toDP(2);
  }

  async purchasingPayment(id: Types.ObjectId, dto: PurchaseOrderDto, sessionIn?: ClientSession): Promise<{ detail: Purchasing | undefined; removedAttachments: string[] }> {
    return this.global.withTransaction(async (session) => {
      const existing = await this.purchasingModel.findById(id).session(session);
      if (!existing) throw BaseResponse.notFound({ err: 'purchasingPayment !existing' });
      if ([PurchasingEn.DROP, PurchasingEn.EXPIRED].includes(existing.status)) {
        throw BaseResponse.invalid({ option: { message: 'Cannot execute payment for dropped or expired purchasing' } });
      }

      const totalPurchasePrice = await this.countTotalPurchasePrice(id);
      const nextStatus = dto.payment_status ?? existing.payment_status;
      const effectivePpnType = dto.ppn_type ?? existing.ppn_type;
      const effectivePpnRate = dto.ppn_rate ?? existing.ppn_rate;
      const effectivePpnAmount = dto.ppn_amount ?? existing.ppn_amount;
      const effectivePaymentRealization = dto.payment_realization ?? existing.payment_realization;
      const effectiveShippingCost = dto.shipping_cost ?? existing.shipping_cost;

      const hasCompletePaymentData =
        effectivePpnType !== undefined &&
        effectivePpnRate !== undefined &&
        effectivePpnAmount !== undefined &&
        effectivePaymentRealization !== undefined &&
        effectiveShippingCost !== undefined;

      let payload: Partial<PurchaseOrderDto> = {};

      if (existing.payment_status === PaymentStatusEn.UNPAID) {
        if (nextStatus !== PaymentStatusEn.UNPAID && !hasCompletePaymentData) {
          throw BaseResponse.invalid({ option: { message: 'Payment and tax fields must be completed before changing status to PARTIAL or PAID' } });
        }

        payload = {
          invoice_number: dto.invoice_number,
          purchasing_attachments: dto.purchasing_attachments,
          ppn_facture_number: dto.ppn_facture_number,
          ppn_type: dto.ppn_type,
          ppn_rate: dto.ppn_rate,
          ppn_amount: dto.ppn_amount,
          shipping_cost: dto.shipping_cost,
          payment_realization: dto.payment_realization,
          paid_total: dto.paid_total,
          notes: dto.notes,
          payment_status: nextStatus,
        }
      } else {
        const hasLockedPaymentDataInput =
          dto.payment_realization !== undefined ||
          dto.ppn_type !== undefined ||
          dto.ppn_rate !== undefined ||
          dto.ppn_amount !== undefined ||
          dto.shipping_cost !== undefined;
        if (hasLockedPaymentDataInput) {
          throw BaseResponse.invalid({ option: { message: 'Cannot change payment_realization, ppn_type, ppn_rate, ppn_amount, shipping_cost, only able to edit those when payment status is UNPAID' } });
        }
        const nextStatus = dto.payment_status ?? PaymentStatusEn.PAID;
        if (nextStatus !== PaymentStatusEn.PAID) {
          throw BaseResponse.invalid({ option: { message: 'When current payment status is PARTIAL, status can only be changed to PAID' } });
        }
        payload = {
          invoice_number: dto.invoice_number,
          purchasing_attachments: dto.purchasing_attachments,
          ppn_facture_number: dto.ppn_facture_number,
          paid_total: dto.paid_total,
          payment_status: PaymentStatusEn.PAID,
        }
      }

      const edit = await this.editPurchasing(id, payload, session);
      if (!edit || !edit.detail) throw BaseResponse.unexpected({ err: 'purchasingPayment' });
      const validation = edit.detail.validation;
      if (edit.detail.payment_status !== PaymentStatusEn.UNPAID && (!validation.is_ppn_valid || !validation.is_payment_match)) {
        const message = `Payment calculation result invalid:\n\nppn type: ${effectivePpnType}\nppn rate: ${effectivePpnRate}\nppn amount: ${effectivePpnAmount?.toString() ?? ''}\ntax base: ${totalPurchasePrice.toString()}\nexpected ppn amount (rounded): ${validation.expected_ppn_amount.toString()}\nexpected minimum payment: ${validation.expected_payable.toString()}\n`;
        throw BaseResponse.invalid({ option: { message } });
      }

      if (edit.detail.payment_status === PaymentStatusEn.UNPAID || !edit.detail.payment_realization) {
        return {
          detail: edit.detail,
          removedAttachments: edit.removedAttachments,
        };
      }

      const hasAccounting = await this.accounting.existsByOrderId(id);

      const accountingPayload: Accounting = {
        flow_type: FlowType.OUT,
        order_id: id,
        order_data: edit.detail,
        order_type: OrderType.PURCHASING,
        transaction_amount: edit.detail.payment_realization,
        tax_base: edit.detail.total_purchase_price,
        ppn_type: edit.detail.ppn_type,
        ppn_rate: edit.detail.ppn_rate,
        ppn_amount: edit.detail.ppn_amount,
        tax_facture_number: edit.detail.ppn_facture_number,
        record_date: new Date(),
      }

      if (!hasAccounting) {
        await this.accounting.createAccountingItem(accountingPayload, session)
      } else {
        await this.accounting.editAccountingByOrderId(
          id,
          {
            transaction_amount: edit.detail.payment_realization,
            tax_base: edit.detail.total_purchase_price,
            ppn_type: edit.detail.ppn_type,
            ppn_rate: edit.detail.ppn_rate,
            ppn_amount: edit.detail.ppn_amount,
            tax_facture_number: edit.detail.ppn_facture_number,
            order_data: edit.detail,
            record_date: new Date(),
          },
          session,
        );
      }

      return {
        detail: edit.detail,
        removedAttachments: edit.removedAttachments,
      };
    }, sessionIn)
  }

  async receiveOrder(id: Types.ObjectId, dto: { invoice_number?: string, receivedItems: ReceiveOrderItemDto[] }): Promise<Purchasing & Document> {
    return this.global.withTransaction(async (session) => {
      if (!dto.receivedItems.length) {
        throw BaseResponse.invalid({ option: { message: 'No items to receive' } });
      }

      const purchase = await this.purchasingModel.findById(id).session(session);
      if (!purchase)
        throw BaseResponse.notFound({ err: 'receiveOrder purchase not found' });
      if (purchase.status !== PurchasingEn.PROCESS && purchase.status !== PurchasingEn.RECEIVE)
        throw BaseResponse.forbidden({ err: 'receiveOrder invalid status' });
      if (purchase.payment_status === PaymentStatusEn.UNPAID) {
        throw BaseResponse.invalid({ option: { message: 'Payment must be at least PARTIAL before receiving goods' } });
      }
      if (
        purchase.ppn_type === undefined ||
        purchase.ppn_rate === undefined ||
        purchase.ppn_amount === undefined ||
        purchase.payment_realization === undefined ||
        purchase.shipping_cost === undefined
      ) {
        throw BaseResponse.invalid({ option: { message: 'Payment fields must be completed before receiving goods' } });
      }

      // Update value received_qty for each item and manage inventory movement
      const existingItems = await this.purchasingItemModel.find({
        purchase_order: id,
      }).session(session);
      const itemMap = new Map( //make list of item with id as key
        existingItems.map(i => [i._id.toString(), i]),
      );

      const inventoryEntries: Array<{
        product: Types.ObjectId;
        qty: number;
        original_price: Decimal;
      }> = [];

      // Create loops for receivedItems, to update received_qty and create inventory movement
      for (const item of dto.receivedItems) {
        const existing = itemMap.get(item._id.toString());
        if (!existing) throw BaseResponse.notFound({ err: 'receiveOrder !existing', option: { message: "One of the item is not in purchasing list, please check your purchasing list" } });

        const delta = item.received_qty ?? 0;
        const newReceived = existing.received_qty + delta;

        if (newReceived > existing.purchase_qty) {
          throw BaseResponse.invalid({
            option: { message: 'Received qty exceeds purchase qty' }
          });
        }

        if (delta > 0) {
          existing.received_qty = newReceived;
          await existing.save({ session });
        }

        if (delta <= 0) continue;

        inventoryEntries.push({
          product: existing.product,
          qty: delta,
          original_price: toDecimal(existing.purchase_price),
        });
      }
      const totalPurchasePrice = await this.countTotalPurchasePrice(id);
      const cost_difference = toDecimal(purchase.payment_realization).minus(toDecimal(totalPurchasePrice));
      const total_items = await this.purchasingItemModel.aggregate([
        { $match: { purchase_order: id } },
        { $group: { _id: null, total: { $sum: "$purchase_qty" } } }
      ]).session(session);

      const totalItemQty = Number(total_items[0]?.total ?? 0);
      const additional_cost_per_item = totalItemQty > 0 ? cost_difference.div(totalItemQty) : new Decimal(0);

      const inventoryMovement: (InventoryMovementDto & { source_id: Types.ObjectId })[] = [];
      // Create loops for inventory movement if there are items received
      if (inventoryEntries.length > 0) {
        inventoryMovement.push({
          movement_type: FlowType.IN,
          items: inventoryEntries.map((entry) => {
            const landed_cost = entry.original_price.plus(additional_cost_per_item);

            return {
              product: new Types.ObjectId(entry.product),
              item_qty: entry.qty,
              receive_date: new Date(),
              original_price: toDecimal128(entry.original_price),
              landed_cost: toDecimal128(landed_cost)
            }
          }),
          order_type: OrderType.PURCHASING,
          source_id: id,
          description: `Purchasing receive order - date: ${digitShortDate(new Date())} - PO ID: ${id.toString()}`
        });

        for (const movement of inventoryMovement) {
          await this.inventoryMovementSvc.move(movement, session);
        }
      }

      const refreshedItems = await this.purchasingItemModel.find({
        purchase_order: id,
      }).session(session);

      const isComplete = refreshedItems.every(
        i => i.purchase_qty === i.received_qty
      );

      const body = {
        invoice_number: dto.invoice_number ?? purchase.invoice_number,
        status: isComplete ? PurchasingEn.COMPLETE : PurchasingEn.RECEIVE,
        completed_date: isComplete ? new Date() : undefined
      }
      const updatedPurchase = await this.purchasingModel.findByIdAndUpdate(id, body, { session })
      if (!updatedPurchase) throw BaseResponse.unexpected({ err: { text: 'receiveOrder failed to editPurchasing' } });
      return updatedPurchase;
    });
  }
}
