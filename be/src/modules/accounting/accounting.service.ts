import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { FlowType, OrderType } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { Accounting } from './accounting.schema';
import { Purchasing } from '../purchasing/purchasing.schema';

@Injectable()
export class AccountingService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @InjectModel(Accounting.name) private accountingModel: Model<Accounting>,
  ) { }

  async createAccountingItem(data: Accounting, sessionIn?: ClientSession): Promise<Accounting | undefined> {
    return this.global.withTransaction(async (session) => {
      if (data.flow_type === FlowType.OUT) { // Withdrawal transaction
        const balance = await this.countBalance(session);
        const tryCount = balance - data.transaction_amount;
        if (tryCount <= 0) {
          throw BaseResponse.forbidden({ err: 'createInvestment insufficient', option: { message: 'Insufficient amount of balance' } })
        }
      }

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
      const { order_type, order_id, flow_type } = data;
      if (flow_type === FlowType.OUT) { // Withdrawal transaction
        const balance = await this.countBalance(session);
        const tryCount = balance - data.transaction_amount;
        if (tryCount <= 0) {
          throw BaseResponse.forbidden({ err: 'createInvestment insufficient', option: { message: 'Insufficient amount of balance' } })
        }
      }

      const result = await this.accountingModel.findOneAndUpdate(
        {
          order_id,
          order_type,
          transaction_amount: { $gte: data.transaction_amount },
        },
        data,
        {
          new: true,
          session,
        }
      );
      if (!result) {
        throw BaseResponse.unexpected({
          err: 'Failed to update accounting item',
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
    const moneyIn = await this.countTotalMoney(FlowType.IN, undefined, sessionIn);
    const moneyOut = await this.countTotalMoney(FlowType.OUT, undefined, sessionIn);
    return moneyIn - moneyOut;
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