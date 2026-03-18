import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { CurrencyEn, FlowType, OrderType } from 'src/types/interfaces';
import { IListRes } from '../../types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { Accounting, IEditAccountingByOrder } from './accounting.schema';
import { AccountingBalance } from './accounting-balance.schema';
import { AccountingSnapshot } from './accounting-snapshot.schema';
import { InventoryItem } from '../inventory-item/inventory-item.schema';
import { decimalToNumber, toDecimal, toDecimal128 } from 'src/utils/helper';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaxTransactionFilterDto } from './accounting.dto';
import Decimal from 'decimal.js';

export interface IPortfolioData {
  balance: number;
  investment: number;
  totalAssets: number;
  inventoryValue: number;
  revenue: number;
  cogs: number;
  profit: number;
  equity: number;
}

export interface ITaxTransaction {
  id: Types.ObjectId;
  type: FlowType;
  source_type: OrderType;
  source_id: Types.ObjectId;
  source_data: any;
  tax_base: number;
  ppn: number;
  faktur_pajak_no?: string;
  transaction_date: Date;
}

@Injectable()
export class AccountingService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @InjectModel(InventoryItem.name) private inventoryItem: Model<InventoryItem>,
    @InjectModel(Accounting.name) private accountingModel: Model<Accounting>,
    @InjectModel(AccountingBalance.name) private balanceModel: Model<AccountingBalance>,
    @InjectModel(AccountingSnapshot.name) private snapshotModel: Model<AccountingSnapshot>,
  ) { }

  private readonly logger = new Logger(AccountingService.name);

  async createAccountingItem(data: Accounting, sessionIn?: ClientSession): Promise<Accounting | undefined> {
    return this.global.withTransaction(async (session) => {
      const { flow_type } = data;
      const before = await this.balanceModel
        .findOne({ currency: CurrencyEn.IDR })
        .session(session);

      console.log({ data });
      console.log('BEFORE:', before?.amount?.toString());
      const filter =
        flow_type === FlowType.OUT
          ? { currency: CurrencyEn.IDR, amount: { $gte: data.transaction_amount } }
          : { currency: CurrencyEn.IDR };

      const amount =
        flow_type === FlowType.OUT
          ? toDecimal128(toDecimal(data.transaction_amount).negated())
          : data.transaction_amount;

      const balance = await this.balanceModel.findOneAndUpdate(
        filter,
        {
          $inc: { amount }
        },
        {
          session,
          new: true,
        },
      );

      if (!balance) {
        throw BaseResponse.invalid({
          err: 'createAccountingItem Insufficient balance', option: { message: 'Insufficient balance' }
        });
      }

      if (!data.record_date) data.record_date = new Date();

      const [created] = await this.accountingModel.create(
        [data],
        { session },
      );

      if (!created) {
        throw BaseResponse.unexpected({
          err: 'Failed to create accounting item',
        });
      }
      return created;
    }, sessionIn);
  }

  async editAccountingByOrderId(order_id: Types.ObjectId, data: IEditAccountingByOrder, sessionIn?: ClientSession): Promise<Accounting | undefined> {
    return this.global.withTransaction(async (session) => {
      const existing = await this.accountingModel.findOne({ order_id }).session(session);
      if (!existing) {
        throw BaseResponse.notFound({ err: 'editAccountingByOrderId !existing', option: { message: 'Accounting item not found' } });
      }
      const { flow_type, transaction_amount } = existing;
      const diff = toDecimal(data.transaction_amount ?? existing.transaction_amount).minus(toDecimal(transaction_amount));
      const amountToInc = flow_type === FlowType.OUT ? diff.negated() : diff;

      console.log({ data, diff: diff.toString(), amountToInc: amountToInc.toString() });
      const before = await this.balanceModel
        .findOne({ currency: CurrencyEn.IDR })
        .session(session);
      console.log('BEFORE:', before?.amount?.toString());

      const filter: any = { currency: CurrencyEn.IDR };
      if (amountToInc.isNeg()) {
        filter.amount = { $gte: toDecimal128(amountToInc.negated()) };
      }

      const balance = await this.balanceModel.findOneAndUpdate(
        filter,
        {
          $inc: { amount: toDecimal128(amountToInc) }
        },
        {
          session,
          new: true,
        },
      );

      if (!balance) {
        throw BaseResponse.invalid({
          err: 'editAccountingByOrderId Insufficient balance', option: { message: 'Insufficient balance' }
        });
      }

      const edited = await this.accountingModel.findOneAndUpdate(
        { order_id },
        {
          transaction_amount: data.transaction_amount ?? existing.transaction_amount,
          order_data: data.order_data ?? existing.order_data,
          tax_base: data.tax_base ?? existing.tax_base,
          ppn_type: data.ppn_type ?? existing.ppn_type,
          ppn_rate: data.ppn_rate ?? existing.ppn_rate,
          ppn_amount: data.ppn_amount ?? existing.ppn_amount,
          pph_type: data.pph_type ?? existing.pph_type,
          pph_rate: data.pph_rate ?? existing.pph_rate,
          pph_amount: data.pph_amount ?? existing.pph_amount,
          tax_facture_number: data.tax_facture_number ?? existing.tax_facture_number,
          record_date: new Date()
        },
        { session },
      );

      if (!edited) {
        throw BaseResponse.unexpected({
          err: 'Failed to edit accounting item',
        });
      }
      return edited;
    }, sessionIn);
  }

  async correctAccountingItem(data: Accounting, sessionIn?: ClientSession): Promise<Accounting | undefined> {
    return this.global.withTransaction(async (session) => {
      const { order_type, order_id } = data;
      const sortByNewest = await this.accountingModel.find({ order_type, order_id }).sort({ createdAt: -1 }).limit(1).session(session);
      const old = sortByNewest[0];
      if (!old) {
        throw BaseResponse.notFound({ err: 'editAccountingItem !old' });
      }
      console.log({ old })
      const record_date = new Date()
      // Reverse old
      await this.createAccountingItem(
        {
          flow_type: old.flow_type === FlowType.IN ? FlowType.OUT : FlowType.IN,
          transaction_amount: old.transaction_amount,
          order_type: old.order_type,
          order_id: order_id,
          order_data: old.order_data,
          correction_id: old._id,
          correction_data: old,
          tax_base: old.tax_base,
          ppn_type: old.ppn_type,
          ppn_rate: old.ppn_rate,
          ppn_amount: old.ppn_amount,
          pph_type: old.pph_type,
          pph_rate: old.pph_rate,
          pph_amount: old.pph_amount,
          tax_facture_number: old.tax_facture_number,
          record_date
        },
        session,
      );
      // Insert corrected
      const result = await this.createAccountingItem(
        { ...data, record_date }
        ,
        session,
      );

      if (!result) {
        throw BaseResponse.unexpected({
          err: 'editAccountingItem !result',
        });
      }
      return result;
    }, sessionIn);
  }



  async countTotalMoney(flow_type?: FlowType, order_type?: OrderType, sessionIn?: ClientSession): Promise<number> {
    return this.global.withTransaction(async (session) => {
      if (!flow_type && !order_type) {
        throw BaseResponse.invalid({ err: 'countTotalMoney !flow_type && !order_type' })
      }
      const match: Partial<Pick<Accounting, 'flow_type' | 'order_type'>> = {};
      if (flow_type) match.flow_type = flow_type;
      if (order_type) match.order_type = order_type;

      const result = await this.accountingModel.aggregate([
        {
          $match: match,
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$transaction_amount" },
          },
        },
      ]).session(session);
      return result[0]?.total ?? 0;
    }, sessionIn);
  }

  async countBalance(sessionIn?: ClientSession): Promise<number> {
    return this.global.withTransaction(async (session) => {
      const balance = await this.balanceModel.findOne({ currency: CurrencyEn.IDR }).session(session);
      return decimalToNumber(balance?.amount) ?? 0;
    }, sessionIn);
  }

  async countTotalCogs(sessionIn?: ClientSession): Promise<number> {
    return this.global.withTransaction(async (session) => {
      const result = await this.accountingModel.aggregate([
        {
          $match: {
            order_type: OrderType.SALE,
            flow_type: FlowType.IN,
          },
        },
        {
          $group: {
            _id: null,
            total_cogs: { $sum: { $toDecimal: "$order_data.total_cogs" } },
          },
        },
      ]).session(session);
      return result[0]?.total_cogs ?? 0;
    }, sessionIn);
  }

  async countProfit(sessionIn?: ClientSession): Promise<number> {
    const revenue = await this.countRevenue(sessionIn);
    const cogs = await this.countTotalCogs(sessionIn);
    const operational = await this.countTotalMoney(FlowType.OUT, OrderType.EXPENSE, sessionIn);
    // Accrual Basis: Profit = Revenue - COGS - Expenses
    return revenue - cogs - operational;
  }

  async countRevenue(sessionIn?: ClientSession): Promise<number> {
    const earnings = await this.countTotalMoney(FlowType.IN, OrderType.SALE, sessionIn);
    return earnings;
  }

  async countTotalAssetValue(sessionIn?: ClientSession): Promise<number> {
    return this.global.withTransaction(async (session) => {
      const inventoryItems = await this.inventoryItem.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: { $toDecimal: "$landed_cost" },
            },
          },
        },
      ]).session(session);
      return inventoryItems[0]?.total ?? 0;
    }, sessionIn);
  }

  /**
   * Total Assets = Cash Balance + Inventory Value
   */
  async countTotalAssets(sessionIn?: ClientSession): Promise<number> {
    return this.global.withTransaction(async (session) => {
      const inventoryItemsValuationTotal = await this.countTotalAssetValue(session);
      const balance = await this.countBalance(sessionIn);
      return balance + inventoryItemsValuationTotal;
    }, sessionIn);
  }

  /**
   * Equity = Total Assets - Total Liabilities
   * (Currently tracking simple liabilities if any, or just assets)
   */
  async countEquity(sessionIn?: ClientSession): Promise<number> {
    return this.global.withTransaction(async (session) => {
      const totalAssets = await this.countTotalAssets(session);
      // Future: subtract actual accounts payable
      const liabilities = 0;
      return totalAssets - liabilities;
    }, sessionIn);
  }

  async countInvestment(sessionIn?: ClientSession): Promise<number> {
    const depo = await this.countTotalMoney(FlowType.IN, OrderType.DEPOSIT, sessionIn);
    const wd = await this.countTotalMoney(FlowType.OUT, OrderType.WITHDRAWAL, sessionIn);
    return depo - wd;
  }

  async getPortofolio(sessionIn?: ClientSession): Promise<IPortfolioData> {
    return this.global.withTransaction(async (session) => {
      const balance = await this.countBalance(session);
      const investment = await this.countInvestment(session);
      const totalAssets = await this.countTotalAssets(session);
      const inventoryValue = await this.countTotalAssetValue(session);
      const revenue = await this.countRevenue(session);
      const cogs = await this.countTotalCogs(session);
      const profit = await this.countProfit(session);
      const equity = await this.countEquity(session);

      return {
        balance,
        investment,
        totalAssets,
        inventoryValue,
        revenue,
        cogs,
        profit,
        equity,
      }
    }, sessionIn);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async takeSnapshot() {
    this.logger.log('Taking daily accounting snapshot...');
    try {
      const portfolio: IPortfolioData = await this.getPortofolio();
      await this.snapshotModel.create({
        balance: toDecimal128(new Decimal(portfolio.balance)),
        investment: toDecimal128(new Decimal(portfolio.investment)),
        total_assets: toDecimal128(new Decimal(portfolio.totalAssets)),
        revenue: toDecimal128(new Decimal(portfolio.revenue)),
        profit: toDecimal128(new Decimal(portfolio.profit)),
        cogs: toDecimal128(new Decimal(portfolio.cogs)),
        equity: toDecimal128(new Decimal(portfolio.equity)),
        snapshot_date: new Date(),
      });
      this.logger.log('Daily accounting snapshot captured successfully.');
    } catch (error) {
      this.logger.error('Failed to capture daily accounting snapshot', error);
    }
  }

  async listTaxTransactions(pagination: TaxTransactionFilterDto): Promise<IListRes<ITaxTransaction>> {
    const { page, size, sortBy, sortDir, search, hasPpnOnly, startDate, endDate } = pagination;
    const isPpnOnly = (hasPpnOnly ?? '') === 'true';

    const dbFilter: any = {
      order_type: { $in: [OrderType.PURCHASING, OrderType.SALE] }
    };

    if (startDate || endDate) {
      dbFilter.record_date = {};
      if (startDate) dbFilter.record_date.$gte = new Date(startDate);
      if (endDate) dbFilter.record_date.$lte = new Date(endDate);
    }

    if (isPpnOnly) {
      dbFilter.$or = [
        { 'ppn_amount': { $gt: 0 } }
      ];
    }

    const list = await this.global.getList<Accounting>(
      this.accountingModel,
      {
        page,
        size,
        sortBy: sortBy || 'record_date',
        sortDir: sortDir || 'desc',
        search,
        searchFields: ['order_type'],
        filter: dbFilter
      }
    );

    const data: ITaxTransaction[] = list.data.map(it => {
      const tx: ITaxTransaction = {
        id: it._id,
        type: it.flow_type,
        source_type: it.order_type,
        source_id: it.order_id,
        source_data: it.order_data,
        tax_base: decimalToNumber(it.tax_base),
        ppn: decimalToNumber(it.ppn_amount),
        faktur_pajak_no: it.tax_facture_number,
        transaction_date: it.record_date || new Date(),
      };
      return tx;
    });

    return {
      meta: list.meta,
      data: data
    };
  }

  async checkSnapshot(date: Date): Promise<boolean> {
    const exists = await this.snapshotModel.exists({
      snapshot_date: { $gt: date }
    });
    return !!exists;
  }

  async existsByOrderId(order_id: Types.ObjectId): Promise<boolean> {
    const exists = await this.accountingModel.exists({ order_id });
    return !!exists;
  }
}