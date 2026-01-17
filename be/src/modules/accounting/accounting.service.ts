import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { CurrencyEn, FlowType, OrderType } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { Accounting } from './accounting.schema';
import { Purchasing } from '../purchasing/purchasing.schema';
import { AccountingBalance } from './accounting-balance.schema';

@Injectable()
export class AccountingService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @InjectModel(Accounting.name) private accountingModel: Model<Accounting>,
    @InjectModel(AccountingBalance.name) private balanceModel: Model<AccountingBalance>,
  ) { }

  async createAccountingItem(data: Accounting, sessionIn?: ClientSession): Promise<Accounting | undefined> {
    return this.global.withTransaction(async (session) => {
      const { flow_type } = data;
      const filter =
        flow_type === FlowType.OUT
          ? { currency: CurrencyEn.IDR, amount: { $gte: data.transaction_amount } }
          : { currency: CurrencyEn.IDR };

      const update =
        flow_type === FlowType.OUT
          ? { $inc: { amount: -data.transaction_amount } }
          : { $inc: { amount: data.transaction_amount } };

      const balance = await this.balanceModel.findOneAndUpdate(
        filter,
        update,
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
      const old = await this.accountingModel.findOne({ order_id, order_type }).session(session);
      if (!old) {
        throw BaseResponse.notFound({ err: 'editAccountingItem !old' });
      }
      const record_date = new Date()
      // Reverse old
      await this.createAccountingItem(
        {
          flow_type: old.flow_type === FlowType.IN ? FlowType.OUT : FlowType.IN,
          transaction_amount: old.transaction_amount,
          order_type: OrderType.ADJUSTMENT,
          order_id: order_id,
          order_data: old,
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
      return balance?.amount ?? 0;
    }, sessionIn);
  }


  async countProfit(sessionIn?: ClientSession): Promise<number> {
    const earnings = await this.countTotalMoney(FlowType.IN, OrderType.SALE, sessionIn);
    const purchasings = await this.countTotalMoney(FlowType.OUT, OrderType.PURCHASING, sessionIn);
    const operational = await this.countTotalMoney(FlowType.OUT, OrderType.EXPENSE, sessionIn);
    return earnings - purchasings - operational;
  }

  async countRevenue(sessionIn?: ClientSession): Promise<number> {
    const earnings = await this.countTotalMoney(FlowType.IN, OrderType.SALE, sessionIn);
    return earnings;
  }

  async countInvestment(sessionIn?: ClientSession): Promise<number> {
    const depo = await this.countTotalMoney(FlowType.IN, OrderType.DEPOSIT, sessionIn);
    const wd = await this.countTotalMoney(FlowType.OUT, OrderType.WITHDRAWAL, sessionIn);
    return depo - wd;
  }
}