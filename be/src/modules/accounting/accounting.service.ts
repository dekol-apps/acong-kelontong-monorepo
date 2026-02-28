import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { CurrencyEn, FlowType, OrderType } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { Accounting } from './accounting.schema';
import { AccountingBalance } from './accounting-balance.schema';
import { InventoryItem } from '../inventory-item/inventory-item.schema';
import { decimalToNumber } from 'src/utils/helper';

@Injectable()
export class AccountingService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @InjectModel(InventoryItem.name) private inventoryItem: Model<InventoryItem>,
    @InjectModel(Accounting.name) private accountingModel: Model<Accounting>,
    @InjectModel(AccountingBalance.name) private balanceModel: Model<AccountingBalance>,
  ) { }

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
          ? Types.Decimal128.fromString(`-${data.transaction_amount.toString()}`)
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

  async editAccountingItem(data: Accounting, sessionIn?: ClientSession): Promise<Accounting | undefined> {
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

  async countProfit(sessionIn?: ClientSession): Promise<number> {
    const earnings = await this.countRevenue(sessionIn);
    const purchasings = await this.countTotalMoney(FlowType.OUT, OrderType.PURCHASING, sessionIn);
    const operational = await this.countTotalMoney(FlowType.OUT, OrderType.EXPENSE, sessionIn);
    return earnings - purchasings - operational;
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
              $sum: {
                $multiply: ["$purchase_price", "$purchase_qty"],
              },
            },
          },
        },
      ]).session(session);
      return inventoryItems[0]?.total ?? 0;
    }, sessionIn);
  }

  async countCapitalValue(sessionIn?: ClientSession): Promise<number> {
    return this.global.withTransaction(async (session) => {
      const inventoryItemsValuationTotal = await this.countTotalAssetValue(session);
      const balance = await this.countBalance(sessionIn);
      return balance + inventoryItemsValuationTotal;
    }, sessionIn);
  }

  async countInvestment(sessionIn?: ClientSession): Promise<number> {
    const depo = await this.countTotalMoney(FlowType.IN, OrderType.DEPOSIT, sessionIn);
    const wd = await this.countTotalMoney(FlowType.OUT, OrderType.WITHDRAWAL, sessionIn);
    return depo - wd;
  }

  async getPortofolio(sessionIn?: ClientSession): Promise<any> {
    return this.global.withTransaction(async (session) => {
      const balance = await this.countBalance(session);
      const investment = await this.countInvestment(session);
      const capValue = await this.countCapitalValue(session);
      const totalAsset = await this.countTotalAssetValue(session);
      const revenue = await this.countRevenue(session);
      const profit = await this.countProfit(session);

      return {
        balance,
        investment,
        capValue,
        totalAsset,
        revenue,
        profit,
      }
    }, sessionIn);
  }
}